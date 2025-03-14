use super::TransactionOperation;
use alloy::{
    network::{Ethereum, TransactionBuilder},
    primitives::{Address, Bytes, U256},
    providers::Provider,
    rpc::types::TransactionRequest,
    sol,
};
use async_trait::async_trait;
use fhevm_engine_common::{tenant_keys::query_tenant_keyid, utils::to_hex};
use sqlx::{Pool, Postgres};
use tokio::task::JoinSet;
use tracing::{error, info, info_span, span};

sol!(
    #[sol(rpc)]
    CiphertextStorage,
    "artifacts/CiphertextStorage.sol/CiphertextStorage.json"
);

#[derive(Clone)]
pub struct AddCiphertextOperation<P: Provider<Ethereum> + Clone + 'static> {
    ciphertext_storage_address: Address,
    provider: P,
    conf: crate::ConfigSettings,
    gas: Option<u64>,
}

impl<P: Provider<Ethereum> + Clone + 'static> AddCiphertextOperation<P> {
    async fn send_transaction(
        db_pool: Pool<Postgres>,
        provider: P,
        handle: Vec<u8>,
        txn_request: impl Into<TransactionRequest>,
    ) -> anyhow::Result<()> {
        let h = to_hex(&handle);

        info!("Processing transaction");

        let txn_req = txn_request.into();
        let transaction = match provider.send_transaction(txn_req.clone()).await {
            Ok(txn) => txn,
            Err(e) => {
                error!(
                    "Transaction {:?} sending failed with error: {}, handle: {}",
                    txn_req, e, h
                );
                // TODO: handle error cases
                return Ok(());
            }
        };

        // Here, we assume we are sending the transaction to a rollup, hence the
        // confirmations of 1.
        let receipt = match transaction
            .with_required_confirmations(1)
            .get_receipt()
            .await
        {
            Ok(receipt) => receipt,
            Err(e) => {
                error!("Getting receipt failed with error: {}", e);
                //self.update_retry_count_by_proof_id(&db_pool, txn_request.0, &e.to_string())
                //   .await?;
                return Err(anyhow::Error::new(e));
            }
        };

        if receipt.status() {
            sqlx::query!(
                "UPDATE ciphertext_digest
                SET is_sent = true
                WHERE handle = $1 AND is_sent = false",
                handle
            )
            .execute(&db_pool)
            .await?;

            info!(
                "Transaction {} succeeded, handle: {}",
                receipt.transaction_hash, h
            );
        } else {
            error!(
                "Transaction {} failed with status {}, handle: {}",
                receipt.transaction_hash,
                receipt.status(),
                h
            );

            // TODO: Update retry

            return Err(anyhow::anyhow!(
                "Transaction {} failed with status {}, handle: {}",
                receipt.transaction_hash,
                receipt.status(),
                h,
            ));
        }
        Ok(())
    }
}

impl<P: Provider<Ethereum> + Clone + 'static> AddCiphertextOperation<P> {
    pub fn new(
        ciphertext_storage_address: Address,
        provider: P,
        conf: crate::ConfigSettings,
        gas: Option<u64>,
    ) -> Self {
        info!(
            "Creating AddCiphertextOperation with gas: {} and storage address: {}",
            gas.unwrap_or(0),
            ciphertext_storage_address
        );

        Self {
            ciphertext_storage_address,
            provider,
            conf,
            gas,
        }
    }
}

#[async_trait]
impl<P> TransactionOperation<P> for AddCiphertextOperation<P>
where
    P: alloy::providers::Provider<Ethereum> + Clone + 'static,
{
    fn channel(&self) -> &str {
        &self.conf.add_ciphertexts_db_channel
    }

    async fn execute(&self, db_pool: &Pool<Postgres>) -> anyhow::Result<bool> {
        // The service responsible for populating the ciphertext_digest table must
        // ensure that ciphertext and ciphertext128 are non-null only after the
        // ciphertexts have been successfully uploaded to AWS S3 buckets.
        let rows = sqlx::query!(
            "
            SELECT handle, ciphertext, ciphertext128, tenant_id
            FROM ciphertext_digest
            WHERE is_sent = false
            AND ciphertext IS NOT NULL
            AND ciphertext128 IS NOT NULL
            LIMIT $1",
            self.conf.add_ciphertexts_batch_limit as i64,
        )
        .fetch_all(db_pool)
        .await?;

        let ciphertext_storage: CiphertextStorage::CiphertextStorageInstance<(), &P> =
            CiphertextStorage::new(self.ciphertext_storage_address, &self.provider);

        info!("Selected {} rows to process", rows.len());

        let mut join_set = JoinSet::new();
        for row in rows.into_iter() {
            let key_id = match query_tenant_keyid(db_pool, row.tenant_id).await {
                Ok(key_id) => key_id,
                Err(_) => {
                    error!(
                        "Failed to get key_id for tenant
                    id: {}",
                        row.tenant_id
                    );
                    continue;
                }
            };

            let handle: Vec<u8> = row.handle.clone();
            let h_as_hex = to_hex(&handle);

            let arr: [u8; 32] = match handle.try_into() {
                Ok(arr) => arr,
                Err(_) => {
                    error!("Invalid handle");
                    continue;
                }
            };

            let (ciphertext64_digest, ciphertext128_digest) =
                match (row.ciphertext, row.ciphertext128) {
                    (Some(ct), Some(ct128)) => (Bytes::from(ct), Bytes::from(ct128)),
                    _ => {
                        error!("Missing ciphertext(s), handle {}", h_as_hex);
                        continue;
                    }
                };

            let handle_u256 = U256::from_be_bytes(arr);
            assert_eq!(ciphertext64_digest.len(), 32);
            assert_eq!(ciphertext128_digest.len(), 32);

            info!(
                "Adding ciphertext, handle: {}, key_id: {}, ct64: {}, ct128: {}",
                h_as_hex,
                key_id,
                to_hex(ciphertext64_digest.as_ref()),
                to_hex(ciphertext128_digest.as_ref()),
            );

            let txn_request = match &self.gas {
                Some(gas_limit) => ciphertext_storage
                    .addCiphertext(
                        handle_u256,
                        U256::from(key_id),
                        ciphertext64_digest,
                        ciphertext128_digest,
                    )
                    .into_transaction_request()
                    .with_gas_limit(*gas_limit),
                None => ciphertext_storage
                    .addCiphertext(
                        handle_u256,
                        U256::from(key_id),
                        ciphertext64_digest,
                        ciphertext128_digest,
                    )
                    .into_transaction_request(),
            };

            let db_pool = db_pool.clone();
            let provider = self.provider.clone();
            let handle = row.handle;

            // drop(guard);
            join_set.spawn(async move {
                Self::send_transaction(db_pool, provider, handle, txn_request).await
            });
        }

        while let Some(res) = join_set.join_next().await {
            res??;
        }

        Ok(false)
    }
}

use alloy::primitives::FixedBytes;
use alloy::providers::{Provider, WalletProvider};
use alloy::{primitives::U256, sol_types::eip712_domain};
use alloy::{providers::ProviderBuilder, signers::SignerSync, sol, sol_types::SolStruct};
use common::{CiphertextStorage, TestEnvironment, ZKPoKManager};
use futures_util::StreamExt;
use rand::random;
use serial_test::serial;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;
use transaction_sender::TransactionSender;

mod common;

#[tokio::test]
#[serial(db)]
async fn verify_proof_response_success() -> anyhow::Result<()> {
    sol! {
        struct VerifyProofSignatureData {
            bytes32[] handles;
            address userAddress;
            address contractAddress;
            uint256 chainId;
        }
    }

    let env = TestEnvironment::new().await?;
    let provider = Arc::new(ProviderBuilder::new().on_anvil_with_wallet());
    let zkpok_manager = ZKPoKManager::deploy(&provider, false, false).await?;
    let ciphertext_storage = CiphertextStorage::deploy(&provider).await?;
    let txn_sender = TransactionSender::new(
        &zkpok_manager.address(),
        &ciphertext_storage.address(),
        env.signer.clone(),
        provider.clone(),
        env.cancel_token.clone(),
        env.conf.clone(),
        None,
    );

    let event_filter = zkpok_manager
        .VerifyProofResponseCalled_filter()
        .watch()
        .await?;

    let proof_id: u32 = random();

    let run_handle = tokio::spawn(async move { txn_sender.run().await });

    let event_handle = tokio::spawn(async move {
        event_filter
            .into_stream()
            .take(1)
            .collect::<Vec<_>>()
            .await
            .first()
            .unwrap()
            .clone()
            .unwrap()
    });

    // Insert a proof into the database.
    sqlx::query!(
        "INSERT INTO verify_proofs (zk_proof_id, chain_id, contract_address, user_address, handles, verified)
         VALUES ($1, $2, $3, $4, $5, true)",
        proof_id as i64,
        42,
        env.signer.address().to_string(),
        env.signer.address().to_string(),
        &[1u8; 64],
    )
    .execute(&env.db_pool)
    .await?;

    // Notify the sender to process the proof.
    sqlx::query!(
        "SELECT pg_notify($1, '')",
        env.conf.verify_proof_resp_db_channel
    )
    .execute(&env.db_pool)
    .await?;

    let event = event_handle.await?;

    let expected_proof_id = U256::from(proof_id);
    let expected_handles: Vec<FixedBytes<32>> = vec![FixedBytes([1u8; 32]), FixedBytes([1u8; 32])];
    let domain = eip712_domain! {
        name: "InputVerifier",
        version: "1",
        chain_id: 42,
        verifying_contract: *zkpok_manager.address(),
    };
    let signing_hash = VerifyProofSignatureData {
        handles: expected_handles.clone(),
        userAddress: env.signer.address(),
        contractAddress: env.signer.address(),
        chainId: U256::from(42),
    }
    .eip712_signing_hash(&domain);
    let expected_sig = env.signer.sign_hash_sync(&signing_hash)?;

    // Make sure data in the event is correct.
    assert_eq!(event.0._0, expected_proof_id);
    assert_eq!(event.0._1, expected_handles);
    assert_eq!(event.0._2.as_ref(), expected_sig.as_bytes());

    // Make sure the proof is removed from the database.
    loop {
        let rows = sqlx::query!(
            "SELECT *
             FROM verify_proofs
             WHERE zk_proof_id = $1",
            proof_id as i64,
        )
        .fetch_all(&env.db_pool)
        .await?;
        if rows.is_empty() {
            break;
        }
        sleep(Duration::from_millis(500)).await;
    }

    env.cancel_token.cancel();
    run_handle.await??;
    Ok(())
}

#[tokio::test]
#[serial(db)]
async fn verify_proof_response_reversal_already_signed() -> anyhow::Result<()> {
    let env = TestEnvironment::new().await?;
    let provider = Arc::new(ProviderBuilder::new().on_anvil_with_wallet());
    let zkpok_manager = ZKPoKManager::deploy(&provider, true, false).await?;
    let ciphertext_storage = CiphertextStorage::deploy(&provider).await?;
    let txn_sender = TransactionSender::new(
        &zkpok_manager.address(),
        &ciphertext_storage.address(),
        env.signer.clone(),
        provider.clone(),
        env.cancel_token.clone(),
        env.conf.clone(),
        None,
    );

    let proof_id: u32 = random();

    let run_handle = tokio::spawn(async move { txn_sender.run().await });

    // Record initial transaction count.
    let initial_tx_count = provider
        .get_transaction_count(provider.default_signer_address())
        .await?;

    // Insert a proof into the database.
    sqlx::query!(
        "INSERT INTO verify_proofs (zk_proof_id, chain_id, contract_address, user_address, handles, verified)
         VALUES ($1, $2, $3, $4, $5, true)",
        proof_id as i64,
        42,
        env.signer.address().to_string(),
        env.signer.address().to_string(),
        &[1u8; 64],
    )
    .execute(&env.db_pool)
    .await?;

    // Notify the sender to process the proof.
    sqlx::query!(
        "SELECT pg_notify($1, '')",
        env.conf.verify_proof_resp_db_channel
    )
    .execute(&env.db_pool)
    .await?;

    // Make sure the proof is removed from the database.
    loop {
        let rows = sqlx::query!(
            "SELECT *
             FROM verify_proofs
             WHERE zk_proof_id = $1",
            proof_id as i64,
        )
        .fetch_all(&env.db_pool)
        .await?;
        if rows.is_empty() {
            break;
        }
        sleep(Duration::from_millis(500)).await;
    }

    // Verify that no transaction has been sent.
    let final_tx_count = provider
        .get_transaction_count(provider.default_signer_address())
        .await?;
    assert_eq!(
        final_tx_count, initial_tx_count,
        "Expected no new transaction to be sent"
    );

    env.cancel_token.cancel();
    run_handle.await??;
    Ok(())
}

#[tokio::test]
#[serial(db)]
async fn verify_proof_response_other_reversal_gas_estimation() -> anyhow::Result<()> {
    let env = TestEnvironment::new().await?;
    let provider = Arc::new(ProviderBuilder::new().on_anvil_with_wallet());
    let zkpok_manager = ZKPoKManager::deploy(&provider, false, true).await?;
    let ciphertext_storage = CiphertextStorage::deploy(&provider).await?;
    let txn_sender = TransactionSender::new(
        &zkpok_manager.address(),
        &ciphertext_storage.address(),
        env.signer.clone(),
        provider.clone(),
        env.cancel_token.clone(),
        env.conf.clone(),
        None,
    );

    let proof_id: u32 = random();

    let run_handle = tokio::spawn(async move { txn_sender.run().await });

    // Insert a proof into the database.
    sqlx::query!(
        "INSERT INTO verify_proofs (zk_proof_id, chain_id, contract_address, user_address, handles, verified)
         VALUES ($1, $2, $3, $4, $5, true)",
        proof_id as i64,
        42,
        env.signer.address().to_string(),
        env.signer.address().to_string(),
        &[1u8; 64],
    )
    .execute(&env.db_pool)
    .await?;

    // Notify the sender to process the proof.
    sqlx::query!(
        "SELECT pg_notify($1, '')",
        env.conf.verify_proof_resp_db_channel
    )
    .execute(&env.db_pool)
    .await?;

    // Make sure the proof retry count is incremented.
    //
    // Note this is a racy test, because the retry count is incremented by the transaction sender and it might
    // get to a point where retry count reaches max retries - then, transaction sender gives up and deletes the entry.
    loop {
        let rows = sqlx::query!(
            "SELECT *
             FROM verify_proofs
             WHERE zk_proof_id = $1",
            proof_id as i64,
        )
        .fetch_all(&env.db_pool)
        .await?;
        assert_eq!(rows.len(), 1);
        if rows.first().unwrap().retry_count > 0 {
            break;
        }
        sleep(Duration::from_millis(500)).await;
    }

    env.cancel_token.cancel();
    run_handle.await??;

    // Make sure the entry is removed at the end of the test.
    sqlx::query("DELETE FROM verify_proofs WHERE zk_proof_id = $1")
        .bind(proof_id as i64)
        .execute(&env.db_pool)
        .await?;
    Ok(())
}

#[tokio::test]
#[serial(db)]
async fn verify_proof_response_other_reversal_receipt() -> anyhow::Result<()> {
    let env = TestEnvironment::new().await?;
    let provider = Arc::new(ProviderBuilder::new().on_anvil_with_wallet());
    let zkpok_manager = ZKPoKManager::deploy(&provider, false, true).await?;
    let ciphertext_storage = CiphertextStorage::deploy(&provider).await?;
    // Create the sender with a gas limit such that no gas estimation is done, forcing failure at receipt (after the txn has been sent).
    let txn_sender = TransactionSender::new(
        &zkpok_manager.address(),
        &ciphertext_storage.address(),
        env.signer.clone(),
        provider.clone(),
        env.cancel_token.clone(),
        env.conf.clone(),
        Some(1_000_000),
    );

    let proof_id: u32 = random();

    let run_handle = tokio::spawn(async move { txn_sender.run().await });

    // Insert a proof into the database.
    sqlx::query!(
        "INSERT INTO verify_proofs (zk_proof_id, chain_id, contract_address, user_address, handles, verified)
         VALUES ($1, $2, $3, $4, $5, true)",
        proof_id as i64,
        42,
        env.signer.address().to_string(),
        env.signer.address().to_string(),
        &[1u8; 64],
    )
    .execute(&env.db_pool)
    .await?;

    // Notify the sender to process the proof.
    sqlx::query!(
        "SELECT pg_notify($1, '')",
        env.conf.verify_proof_resp_db_channel
    )
    .execute(&env.db_pool)
    .await?;

    // Make sure the proof retry count is incremented.
    //
    // Note this is a racy test, because the retry count is incremented by the transaction sender and it might
    // get to a point where retry count reaches max retries - then, transaction sender gives up and deletes the entry.
    loop {
        let rows = sqlx::query!(
            "SELECT *
             FROM verify_proofs
             WHERE zk_proof_id = $1",
            proof_id as i64,
        )
        .fetch_all(&env.db_pool)
        .await?;
        assert_eq!(rows.len(), 1);
        if rows.first().unwrap().retry_count > 0 {
            break;
        }
        sleep(Duration::from_millis(500)).await;
    }

    env.cancel_token.cancel();
    run_handle.await??;

    // Make sure the entry is removed at the end of the test.
    sqlx::query("DELETE FROM verify_proofs WHERE zk_proof_id = $1")
        .bind(proof_id as i64)
        .execute(&env.db_pool)
        .await?;
    Ok(())
}

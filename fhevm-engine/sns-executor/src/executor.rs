use std::error::Error;
use std::time::{self, Duration};

use sqlx::postgres::PgListener;
use sqlx::{Acquire, PgPool, Postgres, Transaction};
use tfhe::integer::IntegerCiphertext;
use tfhe::set_server_key;
use tokio::select;
use tokio::sync::broadcast;
use tracing::{debug, error, info};

use crate::Config;
use crate::{switch_and_squash::Ciphertext128, KeySet};

use fhevm_engine_common::types::{get_ct_type, SupportedFheCiphertexts};

struct SnSTask {
    handle: Vec<u8>,
    compressed: Vec<u8>,
    large_ct: Option<Ciphertext128>,
}

/// Executes the worker logic for the SnS task.
pub(crate) async fn run_loop(
    keys: Option<KeySet>,
    conf: &Config,
    mut cancel: broadcast::Receiver<()>,
) -> Result<(), Box<dyn Error>> {
    let keys = keys.unwrap_or_else(|| unimplemented!("Read keys from the database"));
    let conf = &conf.db;

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(1)
        .connect(&conf.url)
        .await?;

    let mut listener = PgListener::connect_with(&pool).await?;
    listener.listen(&conf.listen_channel).await?;

    loop {
        let mut conn = match acquire_connection(&pool).await {
            Some(conn) => conn,
            None => continue, // Retry acquiring after a delay
        };

        loop {
            let mut db_txn = match conn.begin().await {
                Ok(txn) => txn,
                Err(err) => {
                    error!(target: "worker", "Failed to begin transaction: {err}");
                    break; // Break to reacquire a connection
                }
            };

            if let Some(mut tasks) = query_sns_tasks(&mut db_txn, conf.batch_limit).await? {
                process_tasks(&mut tasks, &keys)?;
                update_large_ct(&mut db_txn, &tasks).await?;
                notify_large_ct_ready(&mut db_txn, &conf.notify_channel).await?;
                db_txn.commit().await?;
            }

            select! {
                _ = cancel.recv() => return Ok(()),
                _ = listener.try_recv() => {
                    debug!(target: "worker", "Received notification");
                }
            }
        }
    }
}

async fn acquire_connection(pool: &PgPool) -> Option<sqlx::pool::PoolConnection<sqlx::Postgres>> {
    match pool.acquire().await {
        Ok(conn) => Some(conn),
        Err(err) => {
            error!(target: "worker", "Failed to acquire connection: {err}");
            tokio::time::sleep(Duration::from_secs(3)).await;
            None
        }
    }
}

/// Queries the database for a fixed number of tasks.
async fn query_sns_tasks(
    db_txn: &mut Transaction<'_, Postgres>,
    limit: u32,
) -> Result<Option<Vec<SnSTask>>, Box<dyn std::error::Error>> {
    let records = sqlx::query!(
        "
        SELECT handle, ciphertext
        FROM ciphertexts
        WHERE ciphertext IS NOT NULL
          AND status = 'DECRYPTABLE'
          AND large_ct IS NULL
        FOR UPDATE SKIP LOCKED
        LIMIT $1;",
        limit as i64
    )
    .fetch_all(db_txn.as_mut())
    .await?;

    info!(target: "sns", { count = records.len()}, "Fetched SnS tasks");

    tokio::time::sleep(time::Duration::from_secs(5)).await;

    if records.is_empty() {
        return Ok(None);
    }

    let tasks = records
        .into_iter()
        .map(|record| SnSTask {
            handle: record.handle,
            compressed: record.ciphertext,
            large_ct: None,
        })
        .collect();

    Ok(Some(tasks))
}

/// Processes the tasks by decompressing and transforming ciphertexts.
fn process_tasks(tasks: &mut [SnSTask], keys: &KeySet) -> Result<(), Box<dyn std::error::Error>> {
    set_server_key(keys.public_keys.server_key.clone());

    for task in tasks.iter_mut() {
        let ct = decompress_ct(&task.handle, &task.compressed)?;
        let raw_ct = ct.to_regular_ciphertext();
        let handle = to_hex(&task.handle);

        let blocks = raw_ct.blocks().len();
        info!(target: "sns",  { handle, blocks }, "Converting ciphertext");

        let large_ct = keys
            .public_keys
            .sns_key
            .as_ref()
            .unwrap()
            .to_large_ciphertext(&raw_ct)
            .unwrap();

        info!(target: "sns",  { handle }, "Ciphertext converted");

        // Optional: Decrypt and log for debugging
        // TODO: Remove this in production
        let decrypted = keys.sns_secret_key.decrypt_128(&large_ct);
        info!(target: "sns", { handle, decrypted }, "Decrypted plaintext");

        task.large_ct = Some(large_ct);
    }

    Ok(())
}

/// Updates the database with the computed large ciphertexts.
async fn update_large_ct(
    db_txn: &mut Transaction<'_, Postgres>,
    tasks: &[SnSTask],
) -> Result<(), Box<dyn Error>> {
    for task in tasks {
        if let Some(large_ct) = &task.large_ct {
            let large_ct_bytes = bincode::serialize(large_ct)?;
            sqlx::query!(
                "
                UPDATE ciphertexts
                SET large_ct = $1,
                    status = 'COMPUTED'
                WHERE handle = $2;",
                large_ct_bytes,
                task.handle
            )
            .execute(db_txn.as_mut())
            .await?;
        } else {
            error!("Large ciphertext not computed for task");
        }
    }
    Ok(())
}

/// Notifies the database that large ciphertexts are ready.
async fn notify_large_ct_ready(
    db_txn: &mut Transaction<'_, Postgres>,
    db_channel: &str,
) -> Result<(), Box<dyn Error>> {
    sqlx::query(&format!("NOTIFY {}", db_channel))
        .execute(db_txn.as_mut())
        .await?;
    Ok(())
}

/// Decompresses a ciphertext based on its type.
fn decompress_ct(
    handle: &[u8],
    compressed_ct: &[u8],
) -> Result<SupportedFheCiphertexts, Box<dyn Error>> {
    let ct_type = get_ct_type(handle)?;
    SupportedFheCiphertexts::decompress(ct_type, compressed_ct).map_err(|e| e.into())
}

// Print first 4 and last 4 bytes of a blob as hex
fn to_hex(handle: &[u8]) -> String {
    const OFFSET: usize = 8;
    match handle.len() {
        0 => String::from("0x"),
        len if len <= 2 * OFFSET => format!("0x{}", hex::encode(handle)),
        _ => {
            let hex_str = hex::encode(handle);
            format!(
                "0x{}...{}",
                &hex_str[..OFFSET],
                &hex_str[hex_str.len() - OFFSET..]
            )
        }
    }
}

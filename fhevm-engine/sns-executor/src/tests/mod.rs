use crate::{keyset::read_sns_sk_from_lo, switch_and_squash::SnsClientKey, Config, DBConfig};
use anyhow::Ok;
use serde::{Deserialize, Serialize};
use sqlx::{pool::PoolConnection, query, Acquire, Postgres, Transaction};
use std::{
    fs::File,
    io::{Read, Write},
    sync::Arc,
    time::Duration,
};
use tokio::{sync::broadcast, time::sleep};

const LISTEN_CHANNEL: &str = "sns_worker_chan";
const TENANT_ID: i32 = 1;

// Poll database until ciphertext128 of the specified handle is available
pub async fn wait_for_ciphertext(
    db_txn: &mut Transaction<'_, Postgres>,
    handle: &[u8],
    retries: u64,
) -> anyhow::Result<Vec<u8>> {
    for retry in 0..retries {
        let record = sqlx::query!(
            "SELECT large_ct FROM ciphertexts WHERE tenant_id = $1 AND handle = $2",
            TENANT_ID,
            handle
        )
        .fetch_one(db_txn.as_mut())
        .await;

        if let Result::Ok(record) = record {
            if let Some(large_ct) = record.large_ct {
                return anyhow::Ok(large_ct);
            }
        }

        println!("wait for ciphertext, retry: {}", retry);

        // Wait before retrying
        sleep(Duration::from_millis(500)).await;
    }

    Err(sqlx::Error::RowNotFound.into())
}

async fn setup(db_url: String) -> anyhow::Result<(PoolConnection<Postgres>, SnsClientKey)> {
    let conf = Config {
        db: DBConfig {
            url: db_url,
            listen_channel: LISTEN_CHANNEL.to_string(),
            notify_channel: "fhevm".to_string(),
            batch_limit: 10,
            polling_interval: 60000,
            max_connections: 5,
        },
    };

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(conf.db.max_connections)
        .connect(&conf.db.url)
        .await?;

    let (tx, _rx) = broadcast::channel(1);
    let cancel_chan = Arc::new(tx);
    let sns_client_keys = read_sns_sk_from_lo(&pool, 1).await?;
    tokio::spawn(async move {
        crate::run(None, &conf, cancel_chan.subscribe())
            .await
            .expect("valid worker");
        anyhow::Result::<()>::Ok(())
    });

    Ok((pool.acquire().await?, sns_client_keys.unwrap()))
}

async fn insert_ciphertext64(
    conn: &mut PoolConnection<Postgres>,
    handle: &Vec<u8>,
    ciphertext: &Vec<u8>,
) -> anyhow::Result<()> {
    let mut db_txn = conn.begin().await?;
    let _ = query!(
        "INSERT INTO ciphertexts(tenant_id, handle, ciphertext, ciphertext_version, ciphertext_type) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING;",
         TENANT_ID,
        handle,
        ciphertext,
        0,
        0,
    )
    .execute(db_txn.as_mut())
    .await
    .expect("insert into ciphertexts");

    // Notify sns_worker
    sqlx::query("SELECT pg_notify($1, '')")
        .bind(LISTEN_CHANNEL)
        .execute(db_txn.as_mut())
        .await?;

    db_txn.commit().await?;

    Ok(())
}

async fn insert_into_pbs_computations(
    conn: &mut PoolConnection<Postgres>,
    handle: &Vec<u8>,
) -> Result<(), anyhow::Error> {
    let mut db_txn = conn.begin().await?;
    let _ = query!(
        "INSERT INTO pbs_computations(tenant_id, handle) VALUES($1, $2) 
             ON CONFLICT DO NOTHING;",
        TENANT_ID,
        handle,
    )
    .execute(db_txn.as_mut())
    .await
    .expect("insert into pbs_computations");

    // Notify sns_worker
    sqlx::query("SELECT pg_notify($1, '')")
        .bind(LISTEN_CHANNEL)
        .execute(db_txn.as_mut())
        .await?;

    db_txn.commit().await?;

    Ok(())
}

/// Deletes all records from `pbs_computations` and `ciphertexts` where `handle` matches.
async fn clean_up(conn: &mut PoolConnection<Postgres>, handle: &Vec<u8>) -> anyhow::Result<()> {
    let mut db_txn = conn.begin().await?;

    sqlx::query!("DELETE FROM pbs_computations WHERE handle = $1", handle)
        .execute(db_txn.as_mut())
        .await?;

    sqlx::query!("DELETE FROM ciphertexts WHERE handle = $1", handle)
        .execute(db_txn.as_mut())
        .await?;

    db_txn.commit().await?;

    Ok(())
}

async fn test_decryptable(
    conn: &mut PoolConnection<Postgres>,
    sns_secret_key: &SnsClientKey,
    handle: &Vec<u8>,
    ciphertext: &Vec<u8>,
    expected_result: i64,
    first_fhe_computation: bool, // first insert ciphertext64 in DB
) -> anyhow::Result<()> {
    clean_up(conn, handle).await?;

    if first_fhe_computation {
        // insert into ciphertexts
        insert_ciphertext64(conn, handle, ciphertext).await?;
        insert_into_pbs_computations(conn, handle).await?;
    } else {
        // insert into pbs_computations
        insert_into_pbs_computations(conn, handle).await?;
        insert_ciphertext64(conn, handle, ciphertext).await?;
    }
    // wait until ciphertext.large_ct is not NULL
    let mut db_txn = conn.begin().await?;
    let data = wait_for_ciphertext(&mut db_txn, handle, 10).await?;

    // deserialize ciphertext128
    let ciphertext128: Vec<tfhe::core_crypto::prelude::LweCiphertext<Vec<u128>>> =
        bincode::deserialize(&data).expect("serializable ciphertext128");

    let decrypted = sns_secret_key.decrypt_128(&ciphertext128);
    println!("Decrypted, plaintext {}", decrypted);

    assert!(decrypted == expected_result as u128);
    anyhow::Result::<()>::Ok(())
}

#[derive(Serialize, Deserialize)]
struct TestFile {
    pub handle: [u8; 32],
    pub ciphertext64: Vec<u8>,
    pub decrypted: i64,
}

/// Creates a test-file from handle, ciphertext64 and plaintext
/// Can be used to update/create_new ciphertext64.bin file
#[allow(dead_code)]
fn write_test_file(filename: &str) {
    let handle: [u8; 32] = hex::decode("TBD").unwrap().try_into().unwrap();
    let ciphertext64 = hex::decode("TBD").unwrap();
    let plaintext = 0;

    let v = TestFile {
        handle,
        ciphertext64,
        decrypted: plaintext,
    };

    // Write bytes to a file
    File::create(filename)
        .expect("Failed to create file")
        .write_all(&bincode::serialize(&v).unwrap())
        .expect("Failed to write to file");
}

fn read_test_file(filename: &str) -> TestFile {
    let mut file = File::open(filename).expect("Failed to open file");
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).expect("Failed to read file");
    bincode::deserialize(&buffer).expect("Failed to deserialize")
}

#[tokio::test]
async fn test_fhe_ciphertext128() {
    tracing_subscriber::fmt().json().with_level(true).init();
    // TODO: DB Setup
    let db_url = "postgres://postgres:postgres@localhost:5432/coprocessor".to_string();

    let (mut conn, sns_client_key) = setup(db_url).await.expect("valid setup");

    let tf: TestFile = read_test_file("ciphertext64.bin");

    test_decryptable(
        &mut conn,
        &sns_client_key,
        &tf.handle.into(),
        &tf.ciphertext64.clone(),
        tf.decrypted,
        true,
    )
    .await
    .expect("test_decryptable, first_fhe_computation = true");

    test_decryptable(
        &mut conn,
        &sns_client_key,
        &tf.handle.into(),
        &tf.ciphertext64,
        tf.decrypted,
        false,
    )
    .await
    .expect("test_decryptable, first_fhe_computation = false");
}

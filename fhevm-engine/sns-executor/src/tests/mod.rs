use crate::{keyset::read_sns_sk_from_lo, switch_and_squash::SnsClientKey, Config, DBConfig};
use anyhow::Ok;
use serde::{Deserialize, Serialize};
use std::{
    fs::File,
    io::{Read, Write},
    sync::Arc,
    time::Duration,
};
use test_harness::instance::DBInstance;
use tokio::{sync::broadcast, time::sleep};

const LISTEN_CHANNEL: &str = "sns_worker_chan";
const TENANT_ID: i32 = 1;

#[tokio::test]
#[ignore = "requires valid SnS keys in CI"]
async fn test_fhe_ciphertext128() {
    let (conn, sns_client_key, _rx, _test_instance) = setup().await.expect("valid setup");
    let tf: TestFile = read_test_file("ciphertext64.bin");

    test_decryptable(
        &conn,
        &sns_client_key,
        &tf.handle.into(),
        &tf.ciphertext64.clone(),
        tf.decrypted,
        true,
    )
    .await
    .expect("test_decryptable, first_fhe_computation = true");

    test_decryptable(
        &conn,
        &sns_client_key,
        &tf.handle.into(),
        &tf.ciphertext64,
        tf.decrypted,
        false,
    )
    .await
    .expect("test_decryptable, first_fhe_computation = false");
}

async fn test_decryptable(
    pool: &sqlx::PgPool,
    sns_secret_key: &SnsClientKey,
    handle: &Vec<u8>,
    ciphertext: &Vec<u8>,
    expected_result: i64,
    first_fhe_computation: bool, // first insert ciphertext64 in DB
) -> anyhow::Result<()> {
    clean_up(pool, handle).await?;

    if first_fhe_computation {
        // insert into ciphertexts
        insert_ciphertext64(pool, handle, ciphertext).await?;
        insert_into_pbs_computations(pool, handle).await?;
    } else {
        // insert into pbs_computations
        insert_into_pbs_computations(pool, handle).await?;
        insert_ciphertext64(pool, handle, ciphertext).await?;
    }
    // wait until ciphertext.large_ct is not NULL
    let data = test_harness::db_utils::wait_for_ciphertext(pool, TENANT_ID, handle, 10).await?;

    // deserialize ciphertext128
    let ciphertext128: Vec<tfhe::core_crypto::prelude::LweCiphertext<Vec<u128>>> =
        bincode::deserialize(&data).expect("serializable ciphertext128");

    let decrypted = sns_secret_key.decrypt_128(&ciphertext128);
    println!("Decrypted, plaintext {}", decrypted);

    assert!(decrypted == expected_result as u128);
    anyhow::Result::<()>::Ok(())
}

async fn setup() -> anyhow::Result<(
    sqlx::PgPool,
    SnsClientKey,
    broadcast::Receiver<()>,
    DBInstance,
)> {
    tracing_subscriber::fmt().json().with_level(true).init();
    let test_instance = test_harness::instance::setup_test_db()
        .await
        .expect("valid db instance");

    let conf = Config {
        db: DBConfig {
            url: test_instance.db_url().to_owned(),
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

    let (tx, rx) = broadcast::channel(1);
    let cancel_chan = Arc::new(tx);
    let sns_client_keys = read_sns_sk_from_lo(&pool, TENANT_ID).await?;
    tokio::spawn(async move {
        crate::run(None, &conf, cancel_chan.subscribe())
            .await
            .expect("valid worker");
        anyhow::Result::<()>::Ok(())
    });

    // TODO: Replace this with notification from the worker when it's in ready-state
    sleep(Duration::from_secs(5)).await;

    Ok((pool, sns_client_keys.unwrap(), rx, test_instance))
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

async fn insert_ciphertext64(
    pool: &sqlx::PgPool,
    handle: &Vec<u8>,
    ciphertext: &Vec<u8>,
) -> anyhow::Result<()> {
    test_harness::db_utils::insert_ciphertext64(pool, TENANT_ID, handle, ciphertext).await?;

    // Notify sns_worker
    sqlx::query("SELECT pg_notify($1, '')")
        .bind(LISTEN_CHANNEL)
        .execute(pool)
        .await?;

    Ok(())
}

async fn insert_into_pbs_computations(
    pool: &sqlx::PgPool,
    handle: &Vec<u8>,
) -> Result<(), anyhow::Error> {
    test_harness::db_utils::insert_into_pbs_computations(pool, TENANT_ID, handle).await?;

    // Notify sns_worker
    sqlx::query("SELECT pg_notify($1, '')")
        .bind(LISTEN_CHANNEL)
        .execute(pool)
        .await?;

    Ok(())
}

/// Deletes all records from `pbs_computations` and `ciphertexts` where `handle` matches.
async fn clean_up(pool: &sqlx::PgPool, handle: &Vec<u8>) -> anyhow::Result<()> {
    sqlx::query!("DELETE FROM pbs_computations WHERE handle = $1", handle)
        .execute(pool)
        .await?;

    sqlx::query!("DELETE FROM ciphertexts WHERE handle = $1", handle)
        .execute(pool)
        .await?;

    Ok(())
}

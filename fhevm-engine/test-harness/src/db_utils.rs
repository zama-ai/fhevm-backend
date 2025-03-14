use rand::distr::Alphanumeric;
use rand::Rng;
use sqlx::postgres::types::Oid;
use sqlx::types::Uuid;
use sqlx::{query, PgPool};
use std::time::Duration;
use tokio::fs;
use tokio::io::AsyncReadExt;
use tokio::time::sleep;

pub const ACL_CONTRACT_ADDR: &str = "0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2";

pub async fn upload_large_object(pool: &PgPool, file_path: &str) -> Result<Oid, sqlx::Error> {
    // Read file asynchronously
    let mut file = fs::File::open(file_path)
        .await
        .expect("Failed to open file");
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .await
        .expect("Failed to read file");

    // Start a transaction
    let mut tx = pool.begin().await?;

    // Create a new large object
    let oid: Oid = sqlx::query_scalar("SELECT lo_create(0)")
        .fetch_one(&mut *tx)
        .await?;

    // Write to the large object
    sqlx::query("SELECT lo_put($1, 0, $2)")
        .bind(oid)
        .bind(&buffer)
        .execute(&mut *tx)
        .await?;

    // Commit transaction
    tx.commit().await?;

    Ok(oid)
}

pub async fn insert_ciphertext64(
    pool: &sqlx::PgPool,
    tenant_id: i32,
    handle: &Vec<u8>,
    ciphertext: &Vec<u8>,
) -> anyhow::Result<()> {
    let _ = query!(
        "INSERT INTO ciphertexts(tenant_id, handle, ciphertext, ciphertext_version, ciphertext_type) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING;",
         tenant_id,
        handle,
        ciphertext,
        0,
        0,
    )
    .execute(pool)
    .await
    .expect("insert into ciphertexts");

    Ok(())
}

pub async fn insert_into_pbs_computations(
    pool: &sqlx::PgPool,
    tenant_id: i32,
    handle: &Vec<u8>,
) -> Result<(), anyhow::Error> {
    let _ = query!(
        "INSERT INTO pbs_computations(tenant_id, handle) VALUES($1, $2) 
             ON CONFLICT DO NOTHING;",
        tenant_id,
        handle,
    )
    .execute(pool)
    .await
    .expect("insert into pbs_computations");

    Ok(())
}

// Poll database until ciphertext128 of the specified handle is available
pub async fn wait_for_ciphertext(
    pool: &sqlx::PgPool,
    tenant_id: i32,
    handle: &Vec<u8>,
    retries: u64,
) -> anyhow::Result<Vec<u8>> {
    for retry in 0..retries {
        let record = sqlx::query!(
            "SELECT ciphertext128 FROM ciphertexts WHERE tenant_id = $1 AND handle = $2",
            tenant_id,
            handle
        )
        .fetch_one(pool)
        .await;

        if let Result::Ok(record) = record {
            if let Some(ciphertext128) = record.ciphertext128 {
                return anyhow::Ok(ciphertext128);
            }
        }

        println!("wait for ciphertext, retry: {}", retry);

        // Wait before retrying
        sleep(Duration::from_millis(500)).await;
    }

    Err(sqlx::Error::RowNotFound.into())
}

pub async fn setup_test_user(pool: &sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    let sks = tokio::fs::read("../fhevm-keys/sks")
        .await
        .expect("can't read sks key");
    let pks = tokio::fs::read("../fhevm-keys/pks")
        .await
        .expect("can't read pks key");
    let cks = tokio::fs::read("../fhevm-keys/cks")
        .await
        .expect("can't read cks key");
    let public_params = tokio::fs::read("../fhevm-keys/pp")
        .await
        .expect("can't read public params");

    let sns_sk_oid = upload_large_object(pool, "../fhevm-keys/sns_sk").await?;
    let sns_pk_oid = upload_large_object(pool, "../fhevm-keys/sns_pk").await?;

    sqlx::query!(
        "
            INSERT INTO tenants(tenant_api_key, chain_id, acl_contract_address, verifying_contract_address, pks_key, sks_key, public_params, cks_key, sns_sk, sns_pk)
            VALUES (
                'a1503fb6-d79b-4e9e-826d-44cf262f3e05',
                12345,
                $1,
                '0x69dE3158643e738a0724418b21a35FAA20CBb1c5',
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )
        ",
        ACL_CONTRACT_ADDR.to_string(),
        &pks,
        &sks,
        &public_params,
        &cks,
        sns_sk_oid,
        sns_pk_oid,
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[derive(Debug)]
pub struct Tenant {
    pub tenant_id: i32,
    pub tenant_api_key: Uuid,
    pub chain_id: i32,
    pub key_id: i32,
    pub verifying_contract_address: String,
    pub acl_contract_address: String,
    pub pks_key: Vec<u8>,
    pub sks_key: Vec<u8>,
    pub public_params: Vec<u8>,
}

pub async fn insert_random_tenant(pool: &PgPool) -> Result<Tenant, sqlx::Error> {
    let chain_id: i32 = rand::rng().random_range(1..10000);
    let key_id: i32 = rand::rng().random_range(1..10000);

    let verifying_contract_address: String = rand::rng()
        .sample_iter(&Alphanumeric)
        .take(42)
        .map(char::from)
        .collect();

    let acl_contract_address: String = rand::rng()
        .sample_iter(&Alphanumeric)
        .take(42)
        .map(char::from)
        .collect();

    let pks_key: Vec<u8> = (0..32).map(|_| rand::random::<u8>()).collect();
    let sks_key: Vec<u8> = (0..32).map(|_| rand::random::<u8>()).collect();
    let public_params: Vec<u8> = (0..64).map(|_| rand::random::<u8>()).collect();

    let row = sqlx::query!(
        r#"
        INSERT INTO tenants (chain_id, key_id, verifying_contract_address, acl_contract_address, 
                            pks_key, sks_key, public_params)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING tenant_id, tenant_api_key, chain_id, verifying_contract_address, 
                  acl_contract_address, pks_key, sks_key, public_params, key_id
        "#,
        chain_id,
        key_id,
        verifying_contract_address,
        acl_contract_address,
        pks_key,
        sks_key,
        public_params
    )
    .fetch_one(pool)
    .await?;

    let tenant = Tenant {
        tenant_id: row.tenant_id,
        tenant_api_key: row.tenant_api_key,
        chain_id: row.chain_id,
        verifying_contract_address: row.verifying_contract_address,
        acl_contract_address: row.acl_contract_address,
        pks_key: row.pks_key,
        sks_key: row.sks_key,
        public_params: row.public_params,
        key_id: row.key_id.unwrap(),
    };

    Ok(tenant)
}

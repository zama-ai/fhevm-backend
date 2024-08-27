use std::collections::{BTreeSet, HashMap};
use std::str::FromStr;

use crate::types::{CoprocessorError, TfheTenantKeys};
use sqlx::{query, Postgres};

/// Returns tenant id upon valid authorization request
pub async fn check_if_api_key_is_valid<T>(
    req: &tonic::Request<T>,
    pool: &sqlx::Pool<Postgres>,
) -> Result<i32, CoprocessorError> {
    match req.metadata().get("authorization") {
        Some(auth) => {
            let auth_header = String::from_utf8(auth.as_bytes().to_owned())
                .map_err(|_| CoprocessorError::Unauthorized)?
                .to_lowercase();

            let prefix = "bearer ";
            if !auth_header.starts_with(prefix) {
                return Err(CoprocessorError::Unauthorized);
            }

            let tail = &auth_header[prefix.len()..];
            let api_key = tail.trim();
            let api_key = match sqlx::types::Uuid::from_str(api_key) {
                Ok(uuid) => uuid,
                Err(_) => return Err(CoprocessorError::Unauthorized),
            };

            let tenant = query!(
                "SELECT tenant_id FROM tenants WHERE tenant_api_key = $1",
                api_key
            )
            .fetch_all(pool)
            .await
            .map_err(Into::<CoprocessorError>::into)?;

            if tenant.is_empty() {
                return Err(CoprocessorError::Unauthorized);
            }

            return Ok(tenant[0].tenant_id);
        }
        None => {
            return Err(CoprocessorError::Unauthorized);
        }
    }
}

/// Returns ciphertext types
pub async fn check_if_ciphertexts_exist_in_db(
    mut cts: BTreeSet<Vec<u8>>,
    tenant_id: i32,
    pool: &sqlx::Pool<Postgres>,
) -> Result<HashMap<Vec<u8>, i16>, CoprocessorError> {
    let handles_to_check_in_db_vec = cts.iter().cloned().collect::<Vec<_>>();
    let ciphertexts = query!(
        r#"
            -- existing computations
            SELECT handle AS "handle!", ciphertext_type AS "ciphertext_type!"
            FROM ciphertexts
            WHERE tenant_id = $2
            AND handle = ANY($1::BYTEA[])
                UNION
            -- pending computations
            SELECT output_handle AS "handle!", output_type AS "ciphertext_type!"
            FROM computations
            WHERE tenant_id = $2
            AND output_handle = ANY($1::BYTEA[])
        "#,
        &handles_to_check_in_db_vec,
        tenant_id,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::<CoprocessorError>::into)?;

    let mut result = HashMap::with_capacity(cts.len());
    for ct in ciphertexts {
        assert!(cts.remove(&ct.handle), "any ciphertext selected must exist");
        assert!(result
            .insert(ct.handle.clone(), ct.ciphertext_type)
            .is_none());
    }

    if !cts.is_empty() {
        return Err(CoprocessorError::UnexistingInputCiphertextsFound(
            cts.into_iter()
                .map(|i| format!("0x{}", hex::encode(i)))
                .collect(),
        ));
    }

    Ok(result)
}

pub async fn fetch_tenant_server_key<'a, T>(tenant_id: i32, pool: T, tenant_key_cache: &std::sync::Arc<tokio::sync::RwLock<lru::LruCache<i32, TfheTenantKeys>>>)
-> Result<tfhe::ServerKey, Box<dyn std::error::Error + Send + Sync>>
where T: sqlx::PgExecutor<'a> + Copy
{
    // try getting from cache until it succeeds with populating cache
    loop {
        {
            let mut w = tenant_key_cache.write().await;
            if let Some(key) = w.get(&tenant_id) {
                return Ok(key.sks.clone());
            }
        }

        populate_cache_with_tenant_keys(vec![tenant_id], pool, &tenant_key_cache).await?;
    }
}

pub async fn query_tenant_keys<'a, T>(tenants_to_query: Vec<i32>, conn: T)
-> Result<Vec<TfheTenantKeys>, Box<dyn std::error::Error + Send + Sync>>
where T: sqlx::PgExecutor<'a>
{
    let mut res = Vec::with_capacity(tenants_to_query.len());
    let keys = query!(
        "
            SELECT tenant_id, pks_key, sks_key
            FROM tenants
            WHERE tenant_id = ANY($1::INT[])
        ",
        &tenants_to_query
    )
    .fetch_all(conn)
    .await?;

    for key in keys {
        let sks: tfhe::ServerKey = bincode::deserialize(&key.sks_key)
            .expect("We can't deserialize our own validated sks key");
        let pks: tfhe::CompactPublicKey = bincode::deserialize(&key.pks_key)
            .expect("We can't deserialize our own validated pks key");
        res.push(TfheTenantKeys { tenant_id: key.tenant_id, sks, pks });
    }

    Ok(res)
}

pub async fn populate_cache_with_tenant_keys<'a, T>(tenants_to_query: Vec<i32>, conn: T, tenant_key_cache: &std::sync::Arc<tokio::sync::RwLock<lru::LruCache<i32, TfheTenantKeys>>>)
-> Result<(), Box<dyn std::error::Error + Send + Sync>>
where T: sqlx::PgExecutor<'a>
{
    if !tenants_to_query.is_empty() {
        let keys = query_tenant_keys(tenants_to_query, conn).await?;

        assert!(
            keys.len() > 0,
            "We should have keys here, otherwise our database is corrupt"
        );

        let mut key_cache = tenant_key_cache.write().await;

        for key in keys {
            key_cache.put(key.tenant_id, key);
        }
    }

    Ok(())
}
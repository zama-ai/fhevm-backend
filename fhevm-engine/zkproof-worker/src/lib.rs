pub mod verifier;
use std::io;

use fhevm_engine_common::types::FhevmError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExecutionError {
    #[error("Database error: {0}")]
    DbError(#[from] sqlx::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] bincode::Error),

    #[error("IO error: {0}")]
    IOError(#[from] io::Error),

    #[error("Invalid CRS bytes {0}")]
    InvalidCrsBytes(String),

    #[error("Invalid Ciphertext bytes {0}")]
    InvalidCiphertextBytes(String),

    #[error("Invalid Compact Public key bytes {0}")]
    InvalidPkBytes(String),

    #[error("Invalid Proof: {0}")]
    InvalidProof(i64),

    #[error("TBD")]
    FaildFhevm(#[from] FhevmError),

    #[error("Server keys not found {0}")]
    ServerKeysNotFound(String),
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_verify_proofs() {
        // TODO: How to fetch an example CRS, Pk and proof to automate this test?
        /*
        if let Err(e) = execute_verify_proof_routine(&pool, &crs, &compact_pubkey).await {
            debug!(target: "worker", "Error executing verify_proof_routine: {:?}", e);
        }
         */
    }
}

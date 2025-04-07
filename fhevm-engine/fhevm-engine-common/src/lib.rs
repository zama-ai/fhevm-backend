pub mod keys;
pub mod tenant_keys;
pub mod tfhe_ops;
pub mod types;
pub mod utils;

pub type ChainId = u64;

pub mod common {
    tonic::include_proto!("fhevm.common");
}

// use fhevm_engine_common::ChainId;;

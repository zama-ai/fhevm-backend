use std::{fs::read, path::Path};

use clap::Parser;
use fhevm_engine_common::utils::{safe_deserialize_sns_key, safe_serialize_key};
use tfhe::ServerKey;
use tracing::{error, info};
#[derive(Parser, Debug, Clone)]
#[command(version, about, long_about = None)]
pub struct Args {
    ///  Server key with noise squashing enabled
    #[arg(long, default_value = "./sks_noise_squashing.bin")]
    pub src_path: String,

    /// Output server key with noise squashing disabled
    #[arg(long, default_value = "./sks_key.bin")]
    pub dst_path: String,
}

/// Extracts the server key without noise squashing from the given path and saves it to the destination path.
pub fn extract_server_key_without_ns(src_path: String, dest_path: String) {
    let dest_path = Path::new(&dest_path);
    let src_path = Path::new(&src_path);
    info!("Reading server key from file {:?}", src_path);

    let server_key: ServerKey = safe_deserialize_sns_key(&read(src_path).expect("read server key"))
        .expect("deserialize server key");

    let (sks, kskm, compression_key, c, noise_squashing_key, tag) = server_key.into_raw_parts();
    if noise_squashing_key.is_none() {
        error!("Server key does not have noise squashing");
        return;
    }

    info!("Creating file {:?}", dest_path);

    let bytes: Vec<u8> = safe_serialize_key(&ServerKey::from_raw_parts(
        sks,
        kskm,
        compression_key,
        c,
        None, // noise squashing key excluded
        tag,
    ));

    std::fs::write(dest_path, bytes).expect("write sks");
}

fn main() {
    tracing_subscriber::fmt().with_level(true).init();

    let args = Args::parse();
    extract_server_key_without_ns(args.src_path, args.dst_path.clone());
    info!(
        "Server key without noise squashing saved to {:?}",
        args.dst_path
    );
}

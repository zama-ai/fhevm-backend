use serde::{de::DeserializeOwned, Serialize};
use sns_executor::DBConfig;
use std::fs;

mod utils;

fn read_element<T: DeserializeOwned + Serialize>(file_path: String) -> anyhow::Result<T> {
    let read_element = fs::read(file_path.clone())?;
    Ok(bincode::deserialize_from(read_element.as_slice())?)
}

#[tokio::main]
async fn main() {
    let args = utils::daemon_cli::parse_args();

    // Read keys from the file path, if specified
    let mut keys = None;
    if let Some(path) = args.keys_file_path {
        keys = Some(read_element(path).expect("Failed to read keys."));
    }

    let db_url = args
        .database_url
        .clone()
        .unwrap_or_else(|| std::env::var("DATABASE_URL").expect("DATABASE_URL is undefined"));

    tracing_subscriber::fmt().json().with_level(true).init();

    let conf = sns_executor::Config {
        db: DBConfig {
            url: db_url,
            listen_channel: args.pg_listen_channel,
            notify_channel: args.pg_notify_channel,
            batch_limit: args.work_items_batch_size,
            polling_interval: args.pg_polling_interval,
            max_connections: args.pg_pool_connections,
        },
    };

    let (_cancel_tx, cancel_rx) = tokio::sync::broadcast::channel(1);

    if let Err(err) = sns_executor::run(keys, &conf, cancel_rx).await {
        tracing::error!("Worker failed: {:?}", err);
    }
}

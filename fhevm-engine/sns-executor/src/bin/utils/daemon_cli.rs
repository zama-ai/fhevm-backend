use clap::{command, Parser};

#[derive(Parser, Debug, Clone)]
#[command(version, about, long_about = None)]
pub struct Args {
    /// Work items batch size
    #[arg(long, default_value_t = 3)]
    pub work_items_batch_size: u32,

    /// NOTIFY/LISTEN channel for database that the worker listen to
    #[arg(long)]
    pub pg_listen_channel: String,

    /// NOTIFY/LISTEN channel for database that the worker notify to
    #[arg(long)]
    pub pg_notify_channel: String,

    /// Postgres database url. If unspecified DATABASE_URL environment variable is used
    #[arg(long)]
    pub database_url: Option<String>,

    /// KeySet file. If unspecified the the keys are read from the database (not implemented)
    #[arg(long)]
    pub keys_file_path: Option<String>,

    /// sns-executor service name in OTLP traces (not implemented)
    #[arg(long, default_value = "sns-executor")]
    pub service_name: String,
}

pub fn parse_args() -> Args {
    Args::parse()
}

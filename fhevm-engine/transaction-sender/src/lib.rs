mod nonce_managed_provider;
mod ops;
mod transaction_sender;

#[derive(Clone, Debug)]
pub struct ConfigSettings {
    pub database_url: String,
    pub database_pool_size: u32,

    pub verify_proof_resp_db_channel: String,
    pub add_ciphertexts_db_channel: String,
    pub allow_handle_db_channel: String,

    pub verify_proof_resp_batch_limit: u32,
    pub verify_proof_resp_max_retries: u32,
    pub verify_proof_remove_after_max_retries: bool,

    pub add_ciphertexts_batch_limit: u32,
    pub add_ciphertexts_max_retries: u32,

    pub allow_handle_batch_limit: u32,
    pub allow_handle_max_retries: u32,

    pub db_polling_interval_secs: u16,

    pub error_sleep_initial_secs: u16,
    pub error_sleep_max_secs: u16,

    pub txn_receipt_timeout_secs: u16,

    pub required_txn_confirmations: u16,

    pub review_after_transport_retries: u16,
}

impl Default for ConfigSettings {
    fn default() -> Self {
        Self {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or("postgres://postgres:postgres@localhost/coprocessor".to_owned()),
            database_pool_size: 10,
            verify_proof_resp_db_channel: "verify_proof_responses".to_owned(),
            add_ciphertexts_db_channel: "add_ciphertexts".to_owned(),
            allow_handle_db_channel: "event_allowed_handle".to_owned(),
            verify_proof_resp_batch_limit: 128,
            verify_proof_resp_max_retries: 3,
            verify_proof_remove_after_max_retries: true,
            db_polling_interval_secs: 5,
            error_sleep_initial_secs: 1,
            error_sleep_max_secs: 16,
            add_ciphertexts_batch_limit: 10,
            add_ciphertexts_max_retries: 15,
            allow_handle_batch_limit: 10,
            allow_handle_max_retries: 10,
            txn_receipt_timeout_secs: 10,
            required_txn_confirmations: 0,
            review_after_transport_retries: 30,
        }
    }
}

pub use nonce_managed_provider::FillersWithoutNonceManagement;
pub use nonce_managed_provider::NonceManagedProvider;
pub use transaction_sender::TransactionSender;

pub const REVIEW: &str = "review";

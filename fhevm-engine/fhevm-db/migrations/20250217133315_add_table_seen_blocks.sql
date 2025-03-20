CREATE TABLE IF NOT EXISTS blocks_seen (
    chain_id INT NOT NULL,
    block_hash BYTEA NOT NULL,
    block_number BIGINT NOT NULL,
    listener_tfhe BOOLEAN NOT NULL DEFAULT FALSE,
    listener_acl BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (chain_id, block_hash)
);

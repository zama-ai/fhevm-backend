ALTER TABLE tenants ADD COLUMN chain_id BIGINT NOT NULL CHECK (chain_id >= 1);
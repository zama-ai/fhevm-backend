ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS gpu_csks_key BYTEA,
ADD COLUMN IF NOT EXISTS gpu_pks_key BYTEA,
ADD COLUMN IF NOT EXISTS gpu_cks_key BYTEA,
ADD COLUMN IF NOT EXISTS gpu_public_params BYTEA;

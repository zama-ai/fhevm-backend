-- Add migration script here
ALTER TABLE ciphertexts 
ADD COLUMN IF NOT EXISTS ciphertext128 BYTEA;
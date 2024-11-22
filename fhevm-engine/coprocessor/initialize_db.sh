#!/bin/bash

# Database configuration
TENANT_API_KEY="e5f23363-ada1-47ba-9a7b-2c33c6231ad8"
CHAIN_ID=11155111
ACL_CONTRACT_ADDRESS="0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2"
VERIFYING_CONTRACT_ADDRESS="0x69dE3158643e738a0724418b21a35FAA20CBb1c5"
PKS_KEY="/fhevm-keys/pks"
SKS_KEY="/fhevm-keys/sks"
PUBLIC_PARAMS="/fhevm-keys/pp"
CKS_KEY="/fhevm-keys/cks"

# 0. Setup environment
apt-get update && apt-get install -y libpq-dev && \
    cargo install sqlx-cli --no-default-features --features postgres --locked && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

echo "Setting up the database with sqlx..."
export DATABASE_URL="postgres://postgres:postgres@db:5432/coprocessor"

# 1: Create Database
echo "Creating database..."
sqlx database create

# 2: Run sqlx migrations
echo "Running migrations..."
sqlx migrate run --source /migrations || { echo "Failed to run migrations."; exit 1; }

echo "Database initialization complete."

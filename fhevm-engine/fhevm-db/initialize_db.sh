#!/bin/bash

# 1: Create Database
echo "Creating database..."
sqlx database create

# 2: Run sqlx migrations
echo "Running migrations..."
sqlx migrate run --source /migrations || { echo "Failed to run migrations."; exit 1; }

# 3. Insert test tenant with keys
echo "Running Insert test tenant..."
TENANT_API_KEY=a1503fb6-d79b-4e9e-826d-44cf262f3e05
ACL_CONTRACT_ADDRESS=0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2
INPUT_VERIFIER_ADDRESS=0x69dE3158643e738a0724418b21a35FAA20CBb1c5

PKS="$(cat /fhevm-keys/pks | xxd -p | tr -d '\n')"
SKS="$(cat /fhevm-keys/sks | xxd -p | tr -d '\n')"
PUBLIC_PARAMS="$(cat /fhevm-keys/pp | xxd -p | tr -d '\n')"
CKS="$(cat /fhevm-keys/cks | xxd -p | tr -d '\n')"

QUERY="
INSERT INTO tenants(tenant_api_key, chain_id, acl_contract_address, verifying_contract_address, pks_key, sks_key, public_params, cks_key)
        VALUES (
            '${TENANT_API_KEY}',
            12345,
            '${ACL_CONTRACT_ADDRESS}',
            '${INPUT_VERIFIER_ADDRESS}',
            decode('${PKS}', 'hex'),
            decode('${SKS}', 'hex'),
            decode('${PUBLIC_PARAMS}', 'hex'),
            decode('${CKS}', 'hex')
        )
"

echo $QUERY | psql $DATABASE_URL

echo 'Test tenant insertion done'

echo "Database initialization complete."
#!/bin/bash
set -e


echo "-------------- Start database initilaization --------------"

echo "Creating database..."
sqlx database create || { echo "Failed to create database."; exit 1; }

echo "Running migrations..."
sqlx migrate run --source /migrations || { echo "Failed to run migrations."; exit 1; }

echo "-------------- Start inserting keys for tenant: $TENANT_API_KEY --------------"

CHAIN_ID=${CHAIN_ID:-"12345"}
PKS_FILE=${PKS_FILE:-"/fhevm-keys/pks"}
SKS_FILE=${SKS_FILE:-"/fhevm-keys/sks"}
PUBLIC_PARAMS_FILE=${PUBLIC_PARAMS_FILE:-"/fhevm-keys/pp"}
SNS_PK_FILE=${SNS_PK_FILE:-"/fhevm-keys/sns_pk"}

for file in "$PKS_FILE" "$SKS_FILE" "$PUBLIC_PARAMS_FILE" "$SNS_PK_FILE"; do
    if [[ ! -f $file ]]; then
        echo "Error: Key file $file not found."; exit 1;
    fi
done

if [[ -z "$DATABASE_URL" || -z "$TENANT_API_KEY" || -z "$ACL_CONTRACT_ADDRESS" || -z "$INPUT_VERIFIER_ADDRESS" ]]; then
    echo "Error: One or more required environment variables are missing."; exit 1;
fi

TENANT_EXISTS=$(psql "$DATABASE_URL" -tAc "SELECT 1 FROM tenants WHERE tenant_api_key = '$TENANT_API_KEY'")

if [ "$TENANT_EXISTS" = "1" ]; then
    echo "Tenant with API key $TENANT_API_KEY already exists. Skipping insertion."
    exit 0
fi

TMP_CSV="/tmp/tenant_data.csv"
echo "tenant_api_key,chain_id,acl_contract_address,verifying_contract_address,pks_key,sks_key,public_params,sns_pk" > $TMP_CSV

import_large_file() {
  local file="$1"
  local db_url="$2"

  local oid
  oid=$(psql "$db_url" -t -c "SELECT lo_create(0)")
  oid=$(echo "$oid" | tr -d ' ')
  >&2 echo "Created large object with OID: $oid"

  # Use psql's \lo_import with specified OID (runs client-side)
  psql "$db_url" > /dev/null 2>&1 <<EOF
  BEGIN;
  \lo_import $file $oid
  COMMIT;
EOF

  echo "$oid"
}

echo "Importing large object from $SNS_PK_FILE ($(du -h "$SNS_PK_FILE" | cut -f1))..."
SNS_PK_OID=$(import_large_file "$SNS_PK_FILE" "$DATABASE_URL")

echo "$TENANT_API_KEY,$CHAIN_ID,$ACL_CONTRACT_ADDRESS,$INPUT_VERIFIER_ADDRESS,\"\\x$(< "$PKS_FILE" xxd -p | tr -d '\n')\",\"\\x$(< "$SKS_FILE" xxd -p | tr -d '\n')\",\"\\x$(< "$PUBLIC_PARAMS_FILE" xxd -p | tr -d '\n')\",$SNS_PK_OID" >> $TMP_CSV

echo "Inserting tenant data from CSV using \COPY..."
psql "$DATABASE_URL" -c "\COPY tenants (tenant_api_key, chain_id, acl_contract_address, verifying_contract_address, pks_key, sks_key, public_params, sns_pk) FROM '$TMP_CSV' CSV HEADER;" || {
    echo "Error: Failed to insert tenant data."; exit 1;
}

echo "Checking large object creation..."
psql "$DATABASE_URL" -c "SELECT loid as oid,
                        pg_size_pretty(SUM(octet_length(data))) as size
                     FROM pg_largeobject
                     GROUP BY loid;"

echo "Checking tenant entry references correct OID..."
psql "$DATABASE_URL" -c "SELECT t.tenant_id,
                        t.tenant_api_key,
                        t.sns_pk,
                        pg_size_pretty((SELECT SUM(octet_length(lo.data))
                                      FROM pg_largeobject lo
                                      WHERE lo.loid = t.sns_pk)) as sns_pk_size
                      FROM tenants t
                      WHERE t.tenant_api_key = '$TENANT_API_KEY';"

rm -f $TMP_CSV
echo "Database initialization keys insertion complete successfully."

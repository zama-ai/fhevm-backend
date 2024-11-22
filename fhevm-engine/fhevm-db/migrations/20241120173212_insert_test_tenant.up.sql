INSERT INTO tenants (
    tenant_api_key, 
    chain_id, 
    acl_contract_address, 
    verifying_contract_address, 
    pks_key, 
    sks_key, 
    public_params, 
    cks_key
) VALUES (
    'a1503fb6-d79b-4e9e-826d-44cf262f3e05',
    12345,
    '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2',
    '0x69dE3158643e738a0724418b21a35FAA20CBb1c5',
    '/fhevm-keys/pks',
    '/fhevm-keys/sks',
    '/fhevm-keys/pp',
    '/fhevm-keys/cks'
) ON CONFLICT DO NOTHING;

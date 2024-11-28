# Application Smart Contract

The application smart contract (ASC) is the main entrypoint of the TKMS.

It allows the user to request decryption and re-encryption of ciphertexts, and key-generation.

The FHEVM interacts with the TKMS through a gateway.

## Key operations

### Key generation

The first thing that should be done is generating the shared private keys, and public keys.

This is done by calling the ASC.

### Key rotation

Key rotation isn't implemented yet.

## Ciphertext operations

All ciphertexts operations requires a proof of ownership that should be verify against the headers of the blockchain they belong to.

That means that updates of the blockchain that uses said ciphertexts should be propagated to the KMS blockchain inclusion contract.

They also need a signature from said blockchain to ensure that the ciphertext indeed belongs to the blockchain.

Ciphertexts should be stored in a kv-store and their handle should be provided when calling the ASC contract.

### Re-encryption

Re-encryption should also provide a public key to use to re-encrypt the value, thus giving ownership of the underlying value to the owner of the private key.

### Decryption

Decryption makes the ciphertext visible by all.


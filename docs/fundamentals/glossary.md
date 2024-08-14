# Glossary

## Smart Contracts

### fhEVM

- _ACL Smart Contract_: Smart contract deployed on the fhEVM blockchain to manage access control of ciphertexts. dApp contracts use this to persists their own access rights and to delegate access to other contracts.

- _Executor_: A component that runs alongside the fhEVM blockchain node/validator and does the FHE computation. The node/validator and the Executor communicate over a network connection.

- _FheLib_: A precompiled contract that is available on nodes/validators. Exposes a number of functions, e.g. getting ciphertexts, verifying inputs, etc. At the time of writing, it exists at address **0x000000000000000000000000000000000000005d**.

- _Gateway Smart Contract_: Smart contract deployed on the fhEVM blockchain that is used by a dApp smart contract to request a decrypt. This emits an event that triggers the gateway.

- _KMS Smart Contract_: Smart contract running on the fhEVM blockchain that is used by a dApp contract to verify decryption results from the KMS. To that end, it contains the identity of the KMS and is used to verify its signatures.

- _Symbolic Execution_: Onchain execution where inputs to FHE operations are symbolic values (also called handles) that refer to ciphertexts. We check constraints on these handles, but ignore their actual values.

### TKMS

- _fhEVM ASC_: Smart contract to which transaction from the gateway (connector) are submitted to. This contract contains all customization logic required to work with the specific fhEVM blockchain.

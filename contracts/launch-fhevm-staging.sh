#!/bin/bash
npx hardhat clean
npx hardhat compile:specific --contract contracts/emptyProxy

mkdir -p addresses

PRIVATE_KEY_FHEVM_DEPLOYER=$(grep PRIVATE_KEY_FHEVM_DEPLOYER .env | cut -d '"' -f 2)
NUM_KMS_SIGNERS=$(grep NUM_KMS_SIGNERS .env | cut -d '"' -f 2)

npx hardhat task:deployEmptyUUPSProxies --use-coprocessor-address true --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging

npx hardhat compile
npx hardhat compile:specific --contract decryptionOracle

npx hardhat task:deployACL --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging
npx hardhat task:deployTFHEExecutor --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging
npx hardhat task:deployKMSVerifier --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging
npx hardhat task:deployInputVerifier --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging
npx hardhat task:deployFHEGasLimit --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging
npx hardhat task:deployDecryptionOracle --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --network staging

npx hardhat task:addSigners --num-signers "$NUM_KMS_SIGNERS" --private-key "$PRIVATE_KEY_FHEVM_DEPLOYER" --use-address true --network staging

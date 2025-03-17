import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import dotenv from 'dotenv';
import fs from 'fs';
import 'hardhat-deploy';
import 'hardhat-ignore-warnings';
import type { HardhatUserConfig, extendProvider } from 'hardhat/config';
import { task } from 'hardhat/config';
import type { NetworkUserConfig } from 'hardhat/types';
import { resolve } from 'path';

import CustomProvider from './CustomProvider';
// Adjust the import path as needed
import './tasks/etherscanVerify';
import './tasks/taskDeploy';
import './tasks/taskUtils';
import './tasks/upgradeProxy';

const NUM_ACCOUNTS = 15;

extendProvider(async (provider, config, network) => {
  const newProvider = new CustomProvider(provider);
  return newProvider;
});

task('compile:specific', 'Compiles only the specified contract')
  .addParam('contract', "The contract's path")
  .setAction(async ({ contract }, hre) => {
    // Adjust the configuration to include only the specified contract
    hre.config.paths.sources = contract;

    await hre.run('compile');
  });

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || './.env';
dotenv.config({ path: resolve(__dirname, dotenvConfigPath) });

// Ensure that we have all the environment variables we need.
let mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  mnemonic = 'adapt mosquito move limb mobile illegal tree voyage juice mosquito burger raise father hope layer'; // default mnemonic in case it is undefined (needed to avoid panicking when deploying on real network)
}

task('coverage').setAction(async (taskArgs, hre, runSuper) => {
  hre.config.networks.hardhat.allowUnlimitedContractSize = true;
  hre.config.networks.hardhat.blockGasLimit = 1099511627775;

  await runSuper(taskArgs);
});

task('test', async (taskArgs, hre, runSuper) => {
  // Run modified test task
  if (hre.network.name === 'hardhat') {
    const privKeyFhevmDeployer = process.env.PRIVATE_KEY_FHEVM_DEPLOYER;
    const privKeyFhevmRelayer = process.env.PRIVATE_KEY_DECRYPTION_ORACLE_RELAYER;
    const decryptionManagerAddress = process.env.DECRYPTION_MANAGER_ADDRESS;
    const zkpokManagerAddress = process.env.ZKPOK_MANAGER_ADDRESS;
    await hre.run('task:faucetToPrivate', { privateKey: privKeyFhevmDeployer });
    await hre.run('task:faucetToPrivate', { privateKey: privKeyFhevmRelayer });

    await hre.run('compile:specific', { contract: 'contracts/emptyProxy' });
    await hre.run('task:deployEmptyUUPSProxies', { privateKey: privKeyFhevmDeployer, useCoprocessorAddress: false });

    await hre.run('compile:specific', { contract: 'contracts' });
    await hre.run('compile:specific', { contract: 'lib' });
    await hre.run('compile:specific', { contract: 'decryptionOracle' });

    await hre.run('task:deployACL', { privateKey: privKeyFhevmDeployer });
    await hre.run('task:deployTFHEExecutor', { privateKey: privKeyFhevmDeployer });
    await hre.run('task:deployKMSVerifier', {
      privateKey: privKeyFhevmDeployer,
      decryptionManagerAddress: decryptionManagerAddress,
      useAddress: false,
    });
    await hre.run('task:deployInputVerifier', {
      privateKey: privKeyFhevmDeployer,
      zkpokManagerAddress: zkpokManagerAddress,
      useAddress: false,
    });
    await hre.run('task:deployFHEGasLimit', { privateKey: privKeyFhevmDeployer });
    await hre.run('task:deployDecryptionOracle', { privateKey: privKeyFhevmDeployer });
  }
  await hre.run('compile:specific', { contract: 'examples' });
  await runSuper();
});

const chainIds = {
  localHostChain: 123456,
  sepolia: 11155111,
  staging: 12345,
  zws_dev: 1337,
  mainnet: 1,
  custom: 9999,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string | undefined = process.env.RPC_URL;
  if (!jsonRpcUrl) {
    jsonRpcUrl = 'http://127.0.0.1:8756';
  }
  return {
    accounts: {
      count: NUM_ACCOUNTS,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: 'sepolia',
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 500000,
  },
  gasReporter: {
    currency: 'USD',
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: './contracts',
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
    staging: getChainConfig('staging'),
    zws_dev: getChainConfig('zws_dev'),
    sepolia: getChainConfig('sepolia'),
    localHostChain: getChainConfig('localHostChain'),
    mainnet: getChainConfig('mainnet'),
    custom: getChainConfig('custom'),
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    version: '0.8.24',
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: 'none',
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
      evmVersion: 'cancun',
      viaIR: false,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  warnings: {
    '*': {
      'transient-storage': false,
    },
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  },
};

export default config;

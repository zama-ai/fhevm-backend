import dotenv from 'dotenv';
import { Wallet } from 'ethers';
import fs from 'fs';
import { ethers, network } from 'hardhat';

import { DecryptionOracle } from '../types';
import { awaitCoprocessor, getClearText } from './coprocessorUtils';

const networkName = network.name;

const parsedEnvACL = dotenv.parse(fs.readFileSync('addresses/.env.acl'));
const aclAdd = parsedEnvACL.ACL_CONTRACT_ADDRESS;

const CiphertextType = {
  0: 'bool',
  1: 'uint8', // corresponding to euint4
  2: 'uint8', // corresponding to euint8
  3: 'uint16',
  4: 'uint32',
  5: 'uint64',
  6: 'uint128',
  7: 'address',
  8: 'uint256',
  9: 'bytes',
  10: 'bytes',
  11: 'bytes',
};

let toSkip: BigInt[] = [];

const currentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' });
};

const parsedEnv = dotenv.parse(fs.readFileSync('addresses/.env.decryptionoracle'));
let relayer: Wallet;
if (networkName === 'hardhat') {
  const privKeyRelayer = process.env.PRIVATE_KEY_DECRYPTION_ORACLE_RELAYER;
  relayer = new ethers.Wallet(privKeyRelayer!, ethers.provider);
}

const argEvents =
  '(uint256 indexed counter, uint256 requestID, bytes32[] cts, address contractCaller, bytes4 callbackSelector)';
const ifaceEventDecryption = new ethers.Interface(['event DecryptionRequest' + argEvents]);

let decryptionOracle: DecryptionOracle;
let firstBlockListening: number;
let lastBlockSnapshotForDecrypt: number;

export const initDecryptionOracle = async (): Promise<void> => {
  firstBlockListening = await ethers.provider.getBlockNumber();
  if (networkName === 'hardhat' && hre.__SOLIDITY_COVERAGE_RUNNING !== true) {
    // evm_snapshot is not supported in coverage mode
    await ethers.provider.send('set_lastBlockSnapshotForDecrypt', [firstBlockListening]);
  }
  // this function will emit logs for every request and fulfilment of a decryption
  decryptionOracle = await ethers.getContractAt('DecryptionOracle', parsedEnv.DECRYPTION_ORACLE_ADDRESS);
  decryptionOracle.on(
    'DecryptionRequest',
    async (counter, requestID, cts, contractCaller, callbackSelector, eventData) => {
      const blockNumber = eventData.log.blockNumber;
      console.log(
        `${await currentTime()} - Requested decrypt on block ${blockNumber} (counter ${counter} - requestID ${requestID})`,
      );
    },
  );
};

export const awaitAllDecryptionResults = async (): Promise<void> => {
  decryptionOracle = await ethers.getContractAt('DecryptionOracle', parsedEnv.DECRYPTION_ORACLE_ADDRESS);
  const provider = ethers.provider;
  if (networkName === 'hardhat' && hre.__SOLIDITY_COVERAGE_RUNNING !== true) {
    // evm_snapshot is not supported in coverage mode
    lastBlockSnapshotForDecrypt = await provider.send('get_lastBlockSnapshotForDecrypt');
    if (lastBlockSnapshotForDecrypt < firstBlockListening) {
      firstBlockListening = lastBlockSnapshotForDecrypt + 1;
    }
  }
  await fulfillAllPastRequestsIds(networkName === 'hardhat');
  firstBlockListening = (await ethers.provider.getBlockNumber()) + 1;
  if (networkName === 'hardhat' && hre.__SOLIDITY_COVERAGE_RUNNING !== true) {
    // evm_snapshot is not supported in coverage mode
    await provider.send('set_lastBlockSnapshotForDecrypt', [firstBlockListening]);
  }
};

const allTrue = (arr: boolean[], fn = Boolean) => arr.every(fn);

const fulfillAllPastRequestsIds = async (mocked: boolean) => {
  const eventDecryption = await decryptionOracle.filters.DecryptionRequest().getTopicFilter();
  const filterDecryption = {
    address: parsedEnv.DECRYPTION_ORACLE_ADDRESS,
    fromBlock: firstBlockListening,
    toBlock: 'latest',
    topics: eventDecryption,
  };
  const pastRequests = await ethers.provider.getLogs(filterDecryption);

  for (const request of pastRequests) {
    const event = ifaceEventDecryption.parseLog(request);
    const requestID = event.args[1];
    const handles = event.args[2];
    const contractCaller = event.args[3];
    const callbackSelector = event.args[4];
    const typesList = handles.map((handle) => parseInt(handle.toString(16).slice(-4, -2), 16));
    // if request is not already fulfilled
    if (mocked && !toSkip.includes(requestID)) {
      // in mocked mode, we trigger the decryption fulfillment manually
      await awaitCoprocessor();

      // first check tat all handles are allowed for decryption
      const aclFactory = await ethers.getContractFactory('ACL');
      const acl = aclFactory.attach(aclAdd);
      const isAllowedForDec = await Promise.all(
        handles.map(async (handle: string) => acl.isAllowedForDecryption(handle)),
      );
      if (!allTrue(isAllowedForDec)) {
        throw new Error('Some handle is not authorized for decryption');
      }
      const types = typesList.map((num: string | number) => CiphertextType[num]);
      const values = await Promise.all(handles.map(async (handle: string) => await getClearText(handle)));

      // TODO: investigate failing tests with the below lines
      const valuesFormatted = values.map((value, index) =>
        types[index] === 'address' ? '0x' + value.toString(16).padStart(40, '0') : value,
      );

      const valuesFormatted2 = valuesFormatted.map((value, index) =>
        typesList[index] === 9 ? '0x' + value.toString(16).padStart(128, '0') : value,
      );
      const valuesFormatted3 = valuesFormatted2.map((value, index) =>
        typesList[index] === 10 ? '0x' + value.toString(16).padStart(256, '0') : value,
      );
      const valuesFormatted4 = valuesFormatted3.map((value, index) =>
        typesList[index] === 11 ? '0x' + value.toString(16).padStart(512, '0') : value,
      );

      const abiCoder = new ethers.AbiCoder();
      let encodedData;
      let decryptedResult;

      encodedData = abiCoder.encode(['uint256', ...types, 'bytes[]'], [31, ...valuesFormatted4, []]); // 31 is just a dummy uint256 requestID to get correct abi encoding for the remaining arguments (i.e everything except the requestID)
      // + adding also a dummy empty array of bytes for correct abi-encoding when used with signatures
      decryptedResult = '0x' + encodedData.slice(66).slice(0, -64); // we pop the dummy requestID to get the correct value to pass for `decryptedCts` + we also pop the last 32 bytes (empty bytes[])

      const numSigners = +process.env.NUM_KMS_SIGNERS!;
      const decryptResultsEIP712signatures = await computeDecryptSignatures(handles, decryptedResult, numSigners);

      const calldata =
        callbackSelector +
        abiCoder
          .encode(['uint256', ...types, 'bytes[]'], [requestID, ...valuesFormatted4, decryptResultsEIP712signatures])
          .slice(2);

      const txData = {
        to: contractCaller,
        data: calldata,
      };
      try {
        const tx = await relayer.sendTransaction(txData);
        await tx.wait();
      } catch (error) {
        console.log('Gateway fulfillment tx failed with the following error:', error.message);
        toSkip.push(requestID);
        throw error;
      }
    }
  }
};

async function computeDecryptSignatures(
  handlesList: string[],
  decryptedResult: string,
  numSigners: number,
): Promise<string[]> {
  const signatures: string[] = [];

  for (let idx = 0; idx < numSigners; idx++) {
    const privKeySigner = process.env[`PRIVATE_KEY_KMS_SIGNER_${idx}`];
    if (privKeySigner) {
      const kmsSigner = new ethers.Wallet(privKeySigner).connect(ethers.provider);
      const signature = await kmsSign(handlesList, decryptedResult, kmsSigner);
      signatures.push(signature);
    } else {
      throw new Error(`Private key for signer ${idx} not found in environment variables`);
    }
  }
  return signatures;
}

async function kmsSign(handlesList: string[], decryptedResult: string, kmsSigner: Wallet) {
  const decManAdd = dotenv.parse(fs.readFileSync('addressesL2/.env.decryptionmanager')).DECRYPTION_MANAGER_ADDRESS;
  const chainId = dotenv.parse(fs.readFileSync('.env')).CHAIN_ID_GATEWAY;

  const domain = {
    name: 'DecryptionManager',
    version: '1',
    chainId: chainId,
    verifyingContract: decManAdd,
  };

  const types = {
    PublicDecryptionResult: [
      {
        name: 'handlesList',
        type: 'bytes32[]',
      },
      {
        name: 'decryptedResult',
        type: 'bytes',
      },
    ],
  };
  const message = {
    handlesList: handlesList,
    decryptedResult: decryptedResult,
  };

  const signature = await kmsSigner.signTypedData(domain, types, message);
  const sigRSV = ethers.Signature.from(signature);
  const v = 27 + sigRSV.yParity;
  const r = sigRSV.r;
  const s = sigRSV.s;

  const result = r + s.substring(2) + v.toString(16);
  return result;
}

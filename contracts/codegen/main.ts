import { mkdirSync, writeFileSync } from 'fs';

import { validateFHETypes, validateOperators } from './common';
import { ALL_OPERATORS } from './operators';
import operatorsPrices from './operatorsPrices.json';
import { generateSolidityFHEGasLimit } from './payments';
import { generateSolidityImplLib, generateSolidityTFHELibAndOverloads } from './templates';
import { generateSolidityUnitTestContracts, generateTypeScriptTestCode, splitOverloadsToShards } from './testgen';
import { ALL_FHE_TYPES } from './types';

/**
 * Generates all necessary files including Solidity contracts and TypeScript test files.
 *
 * This function performs the following steps:
 * 1. Generates FHE types from a JSON file.
 * 2. Validates and processes the list of operators.
 * 3. Generates Solidity source code for TFHE and implementation contracts.
 * 4. Splits the generated overloads into multiple shards to avoid exceeding Solidity's contract size limit.
 * 5. Writes the generated Solidity contracts and test files to the appropriate directories.
 * 6. Generates TypeScript test code for the split overloads and writes them to the test directory.
 *
 */
function generateAllFiles() {
  // const numberOfTestSplits = 12;

  // Validate the FHE types
  validateFHETypes(ALL_FHE_TYPES);
  // Validate the operators
  validateOperators(ALL_OPERATORS);

  const [tfheSolSource] = generateSolidityTFHELibAndOverloads(ALL_OPERATORS, ALL_FHE_TYPES);

  /// Generate core Solidity contract files.
  writeFileSync('lib/Impl.sol', generateSolidityImplLib(ALL_OPERATORS));
  writeFileSync('lib/TFHE.sol', tfheSolSource);
  writeFileSync('contracts/FHEGasLimit.sol', generateSolidityFHEGasLimit(operatorsPrices));

  /// Generate unit test files.
  /** 
  const overloadShards = splitOverloadsToShards(overloads);
  mkdirSync('contracts/tests', { recursive: true });
  overloadShards.forEach((os) => {
    writeFileSync(`examples/tests/TFHETestSuite${os.shardNumber}.sol`, generateSolidityUnitTestContracts(os));
  });

  const tsSplits: string[] = generateTypeScriptTestCode(overloadShards, numberOfTestSplits);
  tsSplits.forEach((split, splitIdx) => writeFileSync(`test/tfheOperations/tfheOperations${splitIdx + 1}.ts`, split));
  */
}

generateAllFiles();

import { assert } from 'console';

import { ArgumentType, FheType, Operator, OperatorArguments, OverloadSignature, ReturnType } from './common';
import { getUint } from './utils';

/**
 * Generates Solidity type aliases from an array of FHE types.
 *
 * This function filters the provided FHE types to include only those that are supported for
 * binary or unary operations. It then maps these types to Solidity type aliases, where each
 * type is represented as a `bytes32`. Additionally, it includes a predefined alias for
 * `einput`, which is represented as `bytes32`.
 *
 * @param fheTypes - An array of FHE types to generate Solidity type aliases from.
 * @returns A string containing the Solidity type aliases, each on a new line.
 */
export function createSolidityTypeAliasesFromFheTypes(fheTypes: FheType[]): string {
  return fheTypes
    .filter((fheType: FheType) => fheType.supportedOperators.length > 0)
    .map((fheType: FheType) => `type ${fheType.type.toLowerCase()} is bytes32;`)
    .concat(['type einput is bytes32;'])
    .join('\n');
}

/**
 * Generates a Solidity enum definition from an array of FheType objects. It is used in Common.sol.
 *
 * @param {FheType[]} fheTypes - An array of FheType objects to be converted into a Solidity enum.
 * @returns {string} A string representing the Solidity enum definition.
 */
export function createSolidityEnumFromFheTypes(fheTypes: FheType[]): string {
  return `enum FheType {
    ${fheTypes
      .filter((fheType: FheType) => !fheType.aliasType)
      .map(
        (fheType: FheType, index: number) =>
          `${fheType.type}${index < fheTypes.filter((fheType: FheType) => !fheType.aliasType).length - 1 ? ',' : ''}`,
      )
      .join('\n')}
}`;
}

/**
 * Generates a Solidity library named `Common.sol` that contains type aliases and enums
 * based on the provided FHE types.
 *
 * The generated library includes:
 * - Type aliases for the provided FHE types.
 * - An enum representing the provided FHE types.
 *
 * @param {FheType[]} fheTypes - An array of FHE types to be used for generating the Solidity Common.sol library.
 * @returns {string} The generated Solidity library code as a string.
 */
function generateSolidityCommonLibrary(fheTypes: FheType[]): string {
  let lib = createSolidityTypeAliasesFromFheTypes(fheTypes);

  lib += `\n
  /**
   * @title   Common
   * @notice  This library contains all the values used to communicate types to the run time.
   *          It matches the tfhe-rs types.
   *          see: https://github.com/zama-ai/tfhe-rs/blob/a2f1825691f9f95e9d241ca4bd4c4598b905f070/tfhe/src/high_level_api/mod.rs
   */
  library Common {
  `;

  lib += createSolidityEnumFromFheTypes(fheTypes);

  lib += `
  }
  `;

  return lib;
}

/**
 * Generates the implementation of a binary operator function for Impl.sol.
 *
 * @param op - The operator for which the implementation is generated.
 * @returns The string representation of the binary operator function.
 */
function handleSolidityBinaryOperatorForImpl(op: Operator): string {
  const scalarArg = op.hasScalar && op.hasEncrypted ? ', bool scalar' : '';
  const scalarByte = op.hasScalar ? '0x01' : '0x00';
  const scalarSection =
    op.hasScalar && op.hasEncrypted
      ? `bytes1 scalarByte;
        if (scalar) {
            scalarByte = 0x01;
        } else {
            scalarByte = 0x00;
        }`
      : `bytes1 scalarByte = ${scalarByte};`;
  return (
    `
    /**
     * @dev Returns the FHEVM config.
     */
    function ${op.name}(bytes32 lhs, bytes32 rhs${scalarArg}) internal returns (bytes32 result) {
        ${scalarSection}
        FHEVMConfigStruct storage $ = getFHEVMConfig();
        result = ITFHEExecutor($.TFHEExecutorAddress).${op.fheLibName}(lhs, rhs, scalarByte);
    }` + '\n'
  );
}

/**
 * Generates the Solidity implementation (Impl.sol) library for FHE operations.
 *
 * @param operators - An array of Operator objects representing the supported operations.
 * @returns A string containing the Solidity implementation library code.
 */
export function generateSolidityImplLib(operators: Operator[]): string {
  const res: string[] = [];

  res.push(`
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./TFHE.sol";

${generateImplCoprocessorInterface(operators)}

${generateACLInterface()}

${generateInputVerifierInterface()}

/**
 * @title   Impl
 * @notice  This library is the core implementation for computing FHE operations (e.g. add, sub, xor).
 */
library Impl {
  /// keccak256(abi.encode(uint256(keccak256("fhevm.storage.FHEVMConfig")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant FHEVMConfigLocation = 0xed8d60e34876f751cc8b014c560745351147d9de11b9347c854e881b128ea600;

  /**
   * @dev Returns the FHEVM config.
   */
  function getFHEVMConfig() internal pure returns (FHEVMConfigStruct storage $) {
      assembly {
          $.slot := FHEVMConfigLocation
      }
  }

  /**
   * @notice            Sets the FHEVM addresses.
   * @param fhevmConfig FHEVM config struct that contains contract addresses.
  */
  function setFHEVM(FHEVMConfigStruct memory fhevmConfig) internal {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      $.ACLAddress = fhevmConfig.ACLAddress;
      $.TFHEExecutorAddress = fhevmConfig.TFHEExecutorAddress;
      $.KMSVerifierAddress = fhevmConfig.KMSVerifierAddress;
      $.InputVerifierAddress = fhevmConfig.InputVerifierAddress;
  }
`);

  operators.forEach((op) => {
    switch (op.arguments) {
      case OperatorArguments.Binary:
        res.push(handleSolidityBinaryOperatorForImpl(op));
        break;
      case OperatorArguments.Unary:
        res.push(handleUnaryOperatorForImpl(op));
        break;
    }
  });

  res.push(generateCustomMethodsForImpl());

  res.push('}\n');

  return res.join('');
}

function generateImplCoprocessorInterface(operators: Operator[]): string {
  const res: string[] = [];

  res.push(`
    /**
     * @title   FHEVMConfigStruct
     * @notice  This struct contains all addresses of core contracts, which are needed in a typical dApp.
     */
    struct FHEVMConfigStruct {
        address ACLAddress;
        address TFHEExecutorAddress;
        address KMSVerifierAddress;
        address InputVerifierAddress;
    }

    /**
    * @title   ITFHEExecutor
    * @notice  This interface contains all functions to conduct FHE operations.
    */
    interface ITFHEExecutor {`);
  operators.forEach((op) => {
    const tail = 'external returns (bytes32 result);';
    let functionArguments: string;
    switch (op.arguments) {
      case OperatorArguments.Binary:
        functionArguments = '(bytes32 lhs, bytes32 rhs, bytes1 scalarByte)';
        res.push(`  
          
          /**
           * @notice              Computes ${op.fheLibName} operation.
           * @param lhs           LHS.
           * @param rhs           RHS.
           * @param scalarByte    Scalar byte.
           * @return result       Result.
           */
          function ${op.fheLibName}${functionArguments} ${tail}`);
        break;
      case OperatorArguments.Unary:
        functionArguments = '(bytes32 ct)';
        res.push(`  

           /**
           * @notice              Computes ${op.fheLibName} operation.
           * @param ct            Ct
           * @return result       Result.
           */
          function ${op.fheLibName}${functionArguments} ${tail}`);
        break;
    }
  });

  res.push(coprocessorInterfaceCustomFunctions());

  res.push('}');

  return res.join('');
}

function coprocessorInterfaceCustomFunctions(): string {
  return `
    /**
     * @notice                Verifies the ciphertext.
     * @param inputHandle     Input handle.
     * @param callerAddress   Address of the caller.
     * @param inputProof      Input proof.
     * @param inputType       Input type.
     * @return result         Result.
     */
    function verifyCiphertext(bytes32 inputHandle, address callerAddress, bytes memory inputProof, bytes1 inputType) external returns (bytes32 result);

    /**
     * @notice          Performs the casting to a target type.
     * @param ct        Value to cast.
     * @param toType    Target type.
     * @return result   Result value of the target type.
     */
    function cast(bytes32 ct, bytes1 toType) external returns (bytes32 result);

     /**
     * @notice          Does trivial encryption.
     * @param ct        Value to encrypt.
     * @param toType    Target type.
     * @return result   Result value of the target type.
     */
    function trivialEncrypt(uint256 ct, bytes1 toType) external returns (bytes32 result);

    /**
     * @notice          Does trivial encryption.
     * @param ct        Value to encrypt.
     * @param toType    Target type.
     * @return result   Result value of the target type.
     */
    function trivialEncrypt(bytes memory ct, bytes1 toType) external returns (bytes32 result);

    /**
     * @notice              Computes FHEEq operation.
     * @param lhs           LHS.
     * @param rhs           RHS.
     * @param scalarByte    Scalar byte.
     * @return result       Result.
     */
    function fheEq(bytes32 lhs, bytes memory rhs, bytes1 scalarByte) external returns (bytes32 result);

    /**
     * @notice              Computes FHENe operation.
     * @param lhs           LHS.
     * @param rhs           RHS.
     * @param scalarByte    Scalar byte.
     * @return result       Result.
     */
    function fheNe(bytes32 lhs, bytes memory rhs, bytes1 scalarByte) external returns (bytes32 result);

    /**
     * @notice              Computes FHEIfThenElse operation.
     * @param control       Control value.
     * @param ifTrue        If true.
     * @param ifFalse       If false.
     * @return result       Result.
     */
    function fheIfThenElse(bytes32 control, bytes32 ifTrue, bytes32 ifFalse) external returns (bytes32 result);

    /**
     * @notice              Computes FHERand operation.
     * @param randType      Type for the random result.
     * @return result       Result.
     */
    function fheRand(bytes1 randType) external returns (bytes32 result);

    /**
     * @notice              Computes FHERandBounded operation.
     * @param upperBound    Upper bound value.
     * @param randType      Type for the random result.
     * @return result       Result.
     */
    function fheRandBounded(uint256 upperBound, bytes1 randType) external returns (bytes32 result);
  `;
}

function generateACLInterface(): string {
  return `
  /**
  * @title   IACL.
  * @notice  This interface contains all functions that are used to conduct operations
  *          with the ACL contract.
  */
  interface IACL {
    /**
     * @notice              Allows the use of handle by address account for this transaction.
     * @dev                 The caller must be allowed to use handle for allowTransient() to succeed.
     *                      If not, allowTransient() reverts.
     *                      The Coprocessor contract can always allowTransient(), contrarily to allow().
     * @param ciphertext    Ciphertext.
     * @param account       Address of the account.
     */
    function allowTransient(bytes32 ciphertext, address account) external;

    /**
     * @notice              Allows the use of handle for the address account.
     * @dev                 The caller must be allowed to use handle for allow() to succeed. If not, allow() reverts.
     * @param handle        Handle.
     * @param account       Address of the account.
     */
    function allow(bytes32 handle, address account) external;

    /**
     * @dev This function removes the transient allowances, which could be useful for integration with
     *      Account Abstraction when bundling several UserOps calling the TFHEExecutorCoprocessor.
     */
    function cleanTransientStorage() external;

    /**
     * @notice              Returns whether the account is allowed to use the handle, either due to
     *                      allowTransient() or allow().
     * @param handle        Handle.
     * @param account       Address of the account.
     * @return isAllowed    Whether the account can access the handle.
     */
    function isAllowed(bytes32 handle, address account) external view returns(bool);

    /**
     * @notice              Allows a list of handles to be decrypted.
     * @param handlesList   List of handles.
     */
    function allowForDecryption(bytes32[] memory handlesList) external;
  }
  `;
}

function generateInputVerifierInterface(): string {
  return `
  /** 
   * @title IInputVerifier 
   * @notice This interface contains the only function required from InputVerifier. 
   */
  interface IInputVerifier {

  /**
   * @dev This function removes the transient allowances, which could be useful for integration with
   *      Account Abstraction when bundling several UserOps calling the TFHEExecutorCoprocessor.
   */
  function cleanTransientStorage() external;
  }
  `;
}

export function generateSolidityTFHELibAndOverloads(
  operators: Operator[],
  fheTypes: FheType[],
): [string, OverloadSignature[]] {
  const signatures: OverloadSignature[] = [];
  const res: string[] = [];

  res.push(`// SPDX-License-Identifier: BSD-3-Clause-Clear
  pragma solidity ^0.8.24;

  import "./Impl.sol";

${generateSolidityCommonLibrary(fheTypes)}

  /**
   * @title   TFHE
   * @notice  This library is the interaction point for all smart contract developers
   *          that interact with TFHE.
   */
  library TFHE {

  /// @notice Returned if the input's length is greater than 64 bytes.
  error InputLengthAbove64Bytes(uint256 inputLength);

  /// @notice Returned if the input's length is greater than 128 bytes.
  error InputLengthAbove128Bytes(uint256 inputLength);

  /// @notice Returned if the input's length is greater than 256 bytes.
  error InputLengthAbove256Bytes(uint256 inputLength);

    /**
     * @notice            Sets the FHEVM addresses.
     * @param fhevmConfig FHEVM config struct that contains contract addresses.
    */
    function setFHEVM(FHEVMConfigStruct memory fhevmConfig) internal {
        Impl.setFHEVM(fhevmConfig);
    }
  `);

  // 1. Exclude types that do not support any operators.
  const adjustedFheTypes = fheTypes.filter((fheType: FheType) => fheType.supportedOperators.length > 0);

  // 2. Generate isInitialized function for all supported types
  adjustedFheTypes.forEach((fheType: FheType) => {
    res.push(handleSolidityTFHEIsInitialized(fheType));
  });

  // 3. Handle encrypted operators for two euint types
  adjustedFheTypes.forEach((lhsFheType: FheType) => {
    adjustedFheTypes.forEach((rhsFheType: FheType) => {
      operators.forEach((operator) => {
        res.push(handleSolidityTFHEEncryptedOperatorForTwoEuint(lhsFheType, rhsFheType, operator, signatures));
      });
    });
  });

  // 4. Handle scalar operators for euint types
  adjustedFheTypes.forEach((fheType: FheType) => {
    operators.forEach((operator) => {
      res.push(generateSolidityTFHEScalarOperator(fheType, operator, signatures));
    });
  });

  // 5. Handle shift & rotate operators for all supported types
  adjustedFheTypes.forEach((fheType: FheType) => {
    operators.forEach((operator) => {
      res.push(handleSolidityTFHEShiftOperator(fheType, operator, signatures));
    });
  });

  // 6. Handle ternary operator (i.e., select) for all supported types
  adjustedFheTypes.forEach((fheType: FheType) => res.push(handleSolidityTFHESelect(fheType)));

  // 7. Handle custom casting (1) between euint types and (2) between an euint type and ebool.
  adjustedFheTypes.forEach((outputFheType: FheType) => {
    adjustedFheTypes.forEach((inputFheType: FheType) => {
      res.push(handleSolidityTFHECustomCastBetweenTwoEuint(inputFheType, outputFheType));
    });
    res.push(handleSolidityTFHECustomCastBetweenEboolAndEuint(outputFheType));
  });

  // 8. Handle unary operators for all supported types.
  adjustedFheTypes.forEach((fheType: FheType) =>
    res.push(handleSolidityTFHEUnaryOperators(fheType, operators, signatures)),
  );

  // 9. Handle conversion from plaintext and einput to all supported types (e.g., einput --> ebool, bytes memory --> ebytes64, uint256 --> euint32)
  adjustedFheTypes.forEach((fheType: FheType) =>
    res.push(handleSolidityTFHEConvertPlaintextAndEinputToRespectiveType(fheType)),
  );

  // 10. Handle rand/randBounded for all supported types
  adjustedFheTypes.forEach((fheType: FheType) => res.push(handleSolidityTFHERand(fheType)));

  // 11. Add padding to bytes for all ebytes types
  adjustedFheTypes.forEach((fheType: FheType) => res.push(handleTFHEPadToBytesForEbytes(fheType)));

  // 12. Push ACL Solidity methods
  res.push(generateSolidityACLMethods(adjustedFheTypes));

  res.push('}\n');

  return [res.join(''), signatures];
}

function handleSolidityTFHEEncryptedOperatorForTwoEuint(
  lhsFheType: FheType,
  rhsFheType: FheType,
  operator: Operator,
  signatures: OverloadSignature[],
): string {
  const res: string[] = [];

  if (operator.shiftOperator || operator.rotateOperator) {
    return '';
  }

  if (!operator.hasEncrypted || operator.arguments != OperatorArguments.Binary) {
    return '';
  }

  if (
    !lhsFheType.type.startsWith('Euint') ||
    !rhsFheType.type.startsWith('Euint') ||
    !lhsFheType.supportedOperators.includes(operator.name) ||
    !rhsFheType.supportedOperators.includes(operator.name)
  ) {
    return '';
  }

  // Determine the maximum number of bits between lhsBits and rhsBits
  const outputBits = Math.max(lhsFheType.bitLength, rhsFheType.bitLength);
  const castLeftToRight = lhsFheType.bitLength < rhsFheType.bitLength;
  const castRightToLeft = lhsFheType.bitLength > rhsFheType.bitLength;

  const returnType =
    operator.returnType == ReturnType.Uint
      ? `euint${outputBits}`
      : operator.returnType == ReturnType.Ebool
        ? `ebool`
        : assert(false, 'Unknown return type');

  const returnTypeOverload: ArgumentType =
    operator.returnType == ReturnType.Uint ? ArgumentType.Euint : ArgumentType.Ebool;

  const scalarFlag = operator.hasEncrypted && operator.hasScalar ? ', false' : '';

  const leftExpr = castLeftToRight ? `asEuint${outputBits}(a)` : 'a';
  const rightExpr = castRightToLeft ? `asEuint${outputBits}(b)` : 'b';
  let implExpression = `Impl.${operator.name}(euint${outputBits}.unwrap(${leftExpr}), euint${outputBits}.unwrap(${rightExpr})${scalarFlag})`;

  signatures.push({
    name: operator.name,
    arguments: [
      { type: ArgumentType.Euint, bits: lhsFheType.bitLength },
      { type: ArgumentType.Euint, bits: rhsFheType.bitLength },
    ],
    returnType: { type: returnTypeOverload, bits: outputBits },
  });
  res.push(`
    /**
    * @dev Evaluates ${operator.name}(a, b) and returns the result.
    */
    function ${operator.name}(${lhsFheType.type.toLowerCase()} a, ${rhsFheType.type.toLowerCase()} b) internal returns (${returnType}) {
        if (!isInitialized(a)) {
            a = as${lhsFheType.type}(0);
        }
        if (!isInitialized(b)) {
            b = as${rhsFheType.type}(0);
        }
        return ${returnType}.wrap(${implExpression});
    }
`);

  return res.join('');
}

function generateSolidityTFHEScalarOperator(
  fheType: FheType,
  operator: Operator,
  signatures: OverloadSignature[],
): string {
  const res: string[] = [];

  if (operator.shiftOperator || operator.rotateOperator) {
    return '';
  }

  if (operator.arguments != OperatorArguments.Binary) {
    return '';
  }

  if (!operator.hasScalar) {
    return '';
  }

  if (!fheType.supportedOperators.includes(operator.name)) {
    return '';
  }

  const outputBits = fheType.bitLength;

  const returnType =
    operator.returnType == ReturnType.Uint
      ? `${fheType.type.toLowerCase()} `
      : operator.returnType == ReturnType.Ebool
        ? `ebool`
        : assert(false, 'Unknown return type');

  const returnTypeOverload = operator.returnType == ReturnType.Uint ? ArgumentType.Euint : ArgumentType.Ebool;
  let scalarFlag = operator.hasEncrypted && operator.hasScalar ? ', true' : '';
  const leftOpName = operator.leftScalarInvertOp ?? operator.name;

  let implExpressionA;

  if (fheType.type == 'Ebool') {
    implExpressionA = `Impl.${operator.name}(${fheType.type.toLowerCase()}.unwrap(a), bytes32(uint256(b?1:0))${scalarFlag})`;
  } else if (fheType.type.startsWith('Ebytes')) {
    implExpressionA = `Impl.${operator.name}(${fheType.type.toLowerCase()}.unwrap(a), b${scalarFlag})`;
  } else if (fheType.type.startsWith('Uint')) {
    throw new Error('Uint types are not supported yet!');
  } else {
    implExpressionA = `Impl.${operator.name}(${fheType.type.toLowerCase()}.unwrap(a), bytes32(uint256(${
      fheType.isAlias && fheType.clearMatchingTypeAlias !== undefined
        ? `${fheType.clearMatchingTypeAlias.toLowerCase()}(b)`
        : 'b'
    }))${scalarFlag})`;
  }

  let implExpressionB;

  if (fheType.type == 'Ebool') {
    implExpressionB = `Impl.${leftOpName}(${fheType.type.toLowerCase()}.unwrap(b), bytes32(uint256(a?1:0))${scalarFlag})`;
  } else if (fheType.type.startsWith('Ebytes')) {
    implExpressionB = `Impl.${leftOpName}(${fheType.type.toLowerCase()}.unwrap(b), a${scalarFlag})`;
  } else if (fheType.type.startsWith('Uint')) {
    throw new Error('Uint types are not supported yet!');
  } else {
    implExpressionB = `Impl.${leftOpName}(${fheType.type.toLowerCase()}.unwrap(b), bytes32(uint256(${
      fheType.isAlias && fheType.clearMatchingTypeAlias !== undefined
        ? `${fheType.clearMatchingTypeAlias.toLowerCase()}(a)`
        : 'a'
    }))${scalarFlag})`;
  }

  let maybeEncryptLeft = '';

  if (operator.leftScalarEncrypt) {
    // workaround until tfhe-rs left scalar support:
    // do the trivial encryption and preserve order of operations
    scalarFlag = ', false';
    maybeEncryptLeft = `${fheType.type.toLowerCase()} aEnc = as${fheType.type}(a);`;
    implExpressionB = `Impl.${leftOpName}(${fheType.type.toLowerCase()}.unwrap(aEnc), ${fheType.type.toLowerCase()}.unwrap(b)${scalarFlag})`;
  }
  signatures.push({
    name: operator.name,
    arguments: [
      { type: ArgumentType.Euint, bits: outputBits },
      { type: ArgumentType.Uint, bits: outputBits },
    ],
    returnType: { type: returnTypeOverload, bits: outputBits },
  });

  // rhs scalar
  res.push(`
    /**
    * @dev Evaluates ${operator.name}(a, b) and returns the result.
    */
    function ${operator.name}(${fheType.type.toLowerCase()} a, ${fheType.clearMatchingType.toLowerCase()} b) internal returns (${returnType}) {
        if (!isInitialized(a)) {
            a = as${fheType.type}(${
              fheType.isAlias && fheType.clearMatchingType !== undefined
                ? `${fheType.clearMatchingType.toLowerCase()}(0)`
                : fheType.type == 'Ebool'
                  ? 'false'
                  : fheType.type.startsWith('Ebytes')
                    ? `padToBytes${fheType.bitLength / 8}(hex"")`
                    : '0'
            });
        }
        return ${returnType}.wrap(${implExpressionA});
    }
`);

  // lhs scalar
  if (!operator.leftScalarDisable) {
    signatures.push({
      name: operator.name,
      arguments: [
        { type: ArgumentType.Uint, bits: outputBits },
        { type: ArgumentType.Euint, bits: outputBits },
      ],
      returnType: { type: returnTypeOverload, bits: outputBits },
    });

    res.push(`

    /**
    * @dev Evaluates ${operator.name}(a, b) and returns the result.
    */
    function ${operator.name}(${fheType.clearMatchingType.toLowerCase()} a, ${fheType.type.toLowerCase()}  b) internal returns (${returnType}) {
        ${maybeEncryptLeft}
        if (!isInitialized(b)) {
            b = as${fheType.type}(${
              fheType.isAlias && fheType.clearMatchingType !== undefined
                ? `${fheType.clearMatchingType.toLowerCase()}(0)`
                : fheType.type == 'Ebool'
                  ? 'false'
                  : fheType.type.startsWith('Ebytes')
                    ? `padToBytes${fheType.bitLength / 8}(hex"")`
                    : '0'
            });
        }
        return ${returnType}.wrap(${implExpressionB});
    }
        `);
  }

  return res.join('');
}

function handleSolidityTFHEIsInitialized(fheType: FheType): string {
  return `
      /**
      * @dev Returns true if the encrypted integer is initialized and false otherwise.
      */
      function isInitialized(${fheType.type.toLowerCase()} v) internal pure returns (bool) {
          return ${fheType.type.toLowerCase()}.unwrap(v) != 0;
      }
    `;
}

function handleSolidityTFHEShiftOperator(
  fheType: FheType,
  operator: Operator,
  signatures: OverloadSignature[],
): string {
  const res: string[] = [];

  if (!operator.shiftOperator && !operator.rotateOperator) {
    return res.join();
  }

  if (fheType.supportedOperators.includes(operator.name)) {
    const lhsBits = fheType.bitLength;
    const rhsBits = 8;
    const castRightToLeft = lhsBits > rhsBits;

    const returnTypeOverload: ArgumentType = ArgumentType.Euint;
    let scalarFlag = ', false';

    const leftExpr = 'a';
    const rightExpr = castRightToLeft ? `as${fheType.type}(b)` : 'b';
    let implExpression: string = `Impl.${operator.name}(${fheType.type.toLowerCase()}.unwrap(${leftExpr}), ${fheType.type.toLowerCase()}.unwrap(${rightExpr})${scalarFlag})`;

    signatures.push({
      name: operator.name,
      arguments: [
        { type: ArgumentType.Euint, bits: lhsBits },
        { type: ArgumentType.Euint, bits: rhsBits },
      ],
      returnType: { type: returnTypeOverload, bits: fheType.bitLength },
    });

    res.push(`
    /** 
     * @dev Evaluates ${operator.name}(a, b) and returns the result.
     */
    function ${operator.name}(euint${lhsBits} a, euint${rhsBits} b) internal returns (${fheType.type.toLowerCase()}) {
        if (!isInitialized(a)) {
            a = asEuint${lhsBits}(0);
        }
        if (!isInitialized(b)) {
            b = asEuint${rhsBits}(0);
        }
        return ${fheType.type.toLowerCase()}.wrap(${implExpression});
    }
`);

    // Code and test for shift(euint{inputBits},uint8}
    scalarFlag = ', true';

    implExpression = `Impl.${operator.name}(${fheType.type.toLowerCase()}.unwrap(a), bytes32(uint256(b))${scalarFlag})`;

    signatures.push({
      name: operator.name,
      arguments: [
        { type: ArgumentType.Euint, bits: lhsBits },
        { type: ArgumentType.Uint, bits: rhsBits },
      ],
      returnType: { type: returnTypeOverload, bits: fheType.bitLength },
    });
    res.push(`
    /** 
     * @dev Evaluates ${operator.name}(a, b) and returns the result.
     */
    function ${operator.name}(${fheType.type.toLowerCase()} a, ${getUint(rhsBits)} b) internal returns (${fheType.type.toLowerCase()}) {
        if (!isInitialized(a)) {
            a = as${fheType.type}(0);
        }
        return ${fheType.type.toLowerCase()}.wrap(${implExpression});
    }
  `);
  }
  return res.join('');
}

function handleSolidityTFHESelect(fheType: FheType): string {
  let res = '';

  if (fheType.supportedOperators.includes('select')) {
    res += `
    /**
    * @dev If 'control's value is 'true', the result has the same value as 'ifTrue'.
    *         If 'control's value is 'false', the result has the same value as 'ifFalse'.
    */
    function select(ebool control, ${fheType.type.toLowerCase()} a, ${fheType.type.toLowerCase()} b) internal returns (${fheType.type.toLowerCase()}) {
        return ${fheType.type.toLowerCase()}.wrap(Impl.select(ebool.unwrap(control), ${fheType.type.toLowerCase()}.unwrap(a), ${fheType.type.toLowerCase()}.unwrap(b)));
    }`;
  }

  return res;
}

function handleSolidityTFHECustomCastBetweenTwoEuint(inputFheType: FheType, outputFheType: FheType): string {
  if (
    inputFheType.type == outputFheType.type ||
    !inputFheType.type.startsWith('Euint') ||
    !outputFheType.type.startsWith('Euint')
  ) {
    return '';
  }

  return `
  /**
    * @dev Casts an encrypted integer from ${inputFheType.type.toLowerCase()} to ${outputFheType.type.toLowerCase()}.
    */
    function as${outputFheType.type}(${inputFheType.type.toLowerCase()} value) internal returns (${outputFheType.type.toLowerCase()}) {
        return ${outputFheType.type.toLowerCase()}.wrap(Impl.cast(${inputFheType.type.toLowerCase()}.unwrap(value), uint8(Common.FheType.${outputFheType.type})));
    }
    `;
}

function handleSolidityTFHECustomCastBetweenEboolAndEuint(fheType: FheType): string {
  const res: string[] = [];

  if (fheType.type.startsWith('Euint') && fheType.supportedOperators.includes('ne')) {
    res.push(`
    /**
    * @dev Casts an encrypted integer from ${fheType.type.toLowerCase()} to ebool.
    */
    function asEbool(${fheType.type.toLowerCase()} value) internal returns (ebool) {
        return ne(value, 0);
    }
    
    /** 
     * @dev Converts an 'ebool' to an ${fheType.type.toLowerCase()}.
     */
    function as${fheType.type}(ebool b) internal returns (${fheType.type.toLowerCase()}) {
        return ${fheType.type.toLowerCase()}.wrap(Impl.cast(ebool.unwrap(b), uint8(Common.FheType.${fheType.type})));
    }
    `);
  }

  return res.join('');
}

function handleSolidityTFHEUnaryOperators(
  fheType: FheType,
  operators: Operator[],
  signatures: OverloadSignature[],
): string {
  const res: string[] = [];

  operators.forEach((op) => {
    if (op.arguments == OperatorArguments.Unary && fheType.supportedOperators.includes(op.name)) {
      // For now, we keep it to generate tests.
      if (fheType.type.startsWith('Euint')) {
        signatures.push({
          name: op.name,
          arguments: [{ type: ArgumentType.Euint, bits: fheType.bitLength }],
          returnType: { type: ArgumentType.Euint, bits: fheType.bitLength },
        });
      }

      res.push(`
          /**
           * @dev Evaluates ${op.name}(a) and returns the result.
           */
        function ${op.name}(${fheType.type.toLowerCase()} value) internal returns (${fheType.type.toLowerCase()}) {
            return ${fheType.type.toLowerCase()}.wrap(Impl.${op.name}(${fheType.type.toLowerCase()}.unwrap(value)));
        }
      `);
    }
  });

  return res.join('\n');
}

/**
 * Generates Solidity functions to convert plaintext and encrypted input handles to their respective encrypted types.
 *
 * @param {FheType} fheType - The Fully Homomorphic Encryption (FHE) type information.
 * @returns {string} - The Solidity code for the conversion functions.
 *
 * The generated functions include:
 * - A function to convert an `einput` handle and its proof to an encrypted type.
 * - If the type is `Ebool`, an additional function to convert a plaintext boolean to an encrypted boolean.
 * - If the type is `Ebytes`, an additional function to convert plaintext bytes to the respective encrypted type.
 * - For other types, a function to convert a plaintext value to the respective encrypted type.
 */
function handleSolidityTFHEConvertPlaintextAndEinputToRespectiveType(fheType: FheType): string {
  let result = `
    /** 
     * @dev Convert an inputHandle with corresponding inputProof to an encrypted ${fheType.type.toLowerCase()} integer.
     */
    function as${fheType.type}(einput inputHandle, bytes memory inputProof) internal returns (${fheType.type.toLowerCase()}) {
        return ${fheType.type.toLowerCase()}.wrap(Impl.verify(einput.unwrap(inputHandle), inputProof, uint8(Common.FheType.${fheType.isAlias ? fheType.aliasType : fheType.type})));
    }

    `;

  /// If boolean, add also the asEbool function that allows casting bool
  if (fheType.type.startsWith('Ebool')) {
    result += `
      /** 
     * @dev Converts a plaintext boolean to an encrypted boolean.
     */
      function asEbool(bool value) internal returns (ebool) {
        return ebool.wrap(Impl.trivialEncrypt(value? 1 : 0, uint8(Common.FheType.Ebool)));
    }

    `;
  } else if (fheType.type.startsWith('Ebytes')) {
    result += `
      /**
        * @dev Convert the plaintext bytes to a ${fheType.type.toLowerCase()} value.
      */
      function as${fheType.type}(${fheType.clearMatchingType} value) internal returns (${fheType.type.toLowerCase()}) {
        return ${fheType.type.toLowerCase()}.wrap(Impl.trivialEncrypt(value, uint8(Common.FheType.${fheType.isAlias ? fheType.aliasType : fheType.type})));
      }
      `;
  } else {
    const value =
      fheType.isAlias && fheType.clearMatchingTypeAlias !== undefined
        ? `${fheType.clearMatchingTypeAlias.toLowerCase()}(value)`
        : 'value';

    result += `
    /** 
     * @dev Convert a plaintext value to an encrypted ${fheType.type.toLowerCase()} integer.
    */
    function as${fheType.type}(${fheType.clearMatchingType} value) internal returns (${fheType.type.toLowerCase()}) {
        return ${fheType.type.toLowerCase()}.wrap(Impl.trivialEncrypt(uint256(${value}), uint8(Common.FheType.${fheType.isAlias ? fheType.aliasType : fheType.type})));
    }

    `;
  }
  return result;
}

/**
 * Generates the implementation of a unary operator function.
 *
 * @param op - The operator for which the implementation is generated.
 * @returns The string representation of the unary operator function.
 */
function handleUnaryOperatorForImpl(op: Operator): string {
  return `
    function ${op.name}(bytes32 ct) internal returns (bytes32 result) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      result = ITFHEExecutor($.TFHEExecutorAddress).${op.fheLibName}(ct);
    }
  `;
}

/**
 * Generates Solidity ACL (Access Control List) methods for the provided FHE types.
 *
 * @param {FheType[]} fheTypes - An array of FHE types for which to generate the ACL methods.
 * @returns {string} A string containing the generated Solidity code for the ACL methods.
 */
function generateSolidityACLMethods(fheTypes: FheType[]): string {
  const res: string[] = [];

  res.push(
    `
    /**
     * @dev This function cleans the transient storage for the ACL (accounts) and the InputVerifier
     *      (input proofs).
     *      This could be useful for integration with Account Abstraction when bundling several 
     *      UserOps calling the TFHEExecutor.
     */
    function cleanTransientStorage() internal {
      Impl.cleanTransientStorageACL();
      Impl.cleanTransientStorageInputVerifier();
    }
  `,
  );

  fheTypes.forEach((fheType: FheType) =>
    res.push(`
    /**
     * @dev Returns whether the account is allowed to use the value.
     */
    function isAllowed(${fheType.type.toLowerCase()} value, address account) internal view returns (bool) {
      return Impl.isAllowed(${fheType.type.toLowerCase()}.unwrap(value), account);
    }

    /**
    * @dev Returns whether the sender is allowed to use the value.
    */
    function isSenderAllowed(${fheType.type.toLowerCase()} value) internal view returns (bool) {
      return Impl.isAllowed(${fheType.type.toLowerCase()}.unwrap(value), msg.sender);
    }

    /**
     * @dev Allows the use of value for the address account.
     */
    function allow(${fheType.type.toLowerCase()} value, address account) internal {
      Impl.allow(${fheType.type.toLowerCase()}.unwrap(value), account);
    }

    /**
     * @dev Allows the use of value for this address (address(this)).
     */
    function allowThis(${fheType.type.toLowerCase()} value) internal {
      Impl.allow(${fheType.type.toLowerCase()}.unwrap(value), address(this));
    }

    /**
     * @dev Allows the use of value by address account for this transaction.
     */
    function allowTransient(${fheType.type.toLowerCase()} value, address account) internal {
      Impl.allowTransient(${fheType.type.toLowerCase()}.unwrap(value), account);
    }

    `),
  );

  return res.join('');
}

function handleTFHEPadToBytesForEbytes(fheType: FheType): string {
  if (!fheType.type.startsWith('Ebytes')) {
    return '';
  }

  const bytesLength = fheType.bitLength / 8;

  return `
        /**
         * @dev Left-pad a bytes array with zeros such that it becomes of length ${bytesLength}.
         */
        function padToBytes${bytesLength}(bytes memory input) internal pure returns (bytes memory) {
          uint256 inputLength = input.length;
    
          if (inputLength > ${bytesLength}) {
              revert InputLengthAbove${bytesLength}Bytes(inputLength);
          }
    
          bytes memory result = new bytes(${bytesLength});
          uint256 paddingLength = ${bytesLength} - inputLength;
    
          for (uint256 i = 0; i < paddingLength; i++) {
              result[i] = 0;
          }

          for (uint256 i = 0; i < inputLength; i++) {
              result[paddingLength + i] = input[i];
          }
          return result;
        }
      `;
}

function generateCustomMethodsForImpl(): string {
  return `
    /**
    * @dev If 'control's value is 'true', the result has the same value as 'ifTrue'.
    *      If 'control's value is 'false', the result has the same value as 'ifFalse'.
    */
    function select(bytes32 control, bytes32 ifTrue, bytes32 ifFalse) internal returns (bytes32 result) {
        FHEVMConfigStruct storage $ = getFHEVMConfig();
        result = ITFHEExecutor($.TFHEExecutorAddress).fheIfThenElse(control, ifTrue, ifFalse);
    }

    /**
     * @notice              Verifies the ciphertext (TFHEExecutor) and allows transient (ACL).
     * @param inputHandle   Input handle.
     * @param inputProof    Input proof.
     * @param toType        Input type.
     * @return result       Result.
     */
    function verify(
        bytes32 inputHandle,
        bytes memory inputProof,
        uint8 toType
    ) internal returns (bytes32 result) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
        result = ITFHEExecutor($.TFHEExecutorAddress).verifyCiphertext(inputHandle, msg.sender, inputProof, bytes1(toType));
        IACL($.ACLAddress).allowTransient(result, msg.sender);
    }

    /**
     * @notice            Performs the casting to a target type.
     * @param ciphertext  Ciphertext to cast.
     * @param toType      Target type.
     * @return result     Result value of the target type.
     */
    function cast(
        bytes32 ciphertext,
        uint8 toType
    ) internal returns (bytes32 result) {
        FHEVMConfigStruct storage $ = getFHEVMConfig();
        result = ITFHEExecutor($.TFHEExecutorAddress).cast(ciphertext, bytes1(toType));
    }

    /**
     * @notice          Does trivial encryption.
     * @param value     Value to encrypt.
     * @param toType    Target type.
     * @return result   Result value of the target type.
     */
    function trivialEncrypt(
        uint256 value,
        uint8 toType
    ) internal returns (bytes32 result) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
        result = ITFHEExecutor($.TFHEExecutorAddress).trivialEncrypt(value, bytes1(toType));
    }

    /**
     * @notice          Does trivial encryption.
     * @param value     Value to encrypt.
     * @param toType    Target type.
     * @return result   Result value of the target type.
     */
    function trivialEncrypt(
      bytes memory value,
      uint8 toType
    ) internal returns (bytes32 result) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
        result = ITFHEExecutor($.TFHEExecutorAddress).trivialEncrypt(value, bytes1(toType));
    }

    /**
     * @notice              Computes FHEEq operation.
     * @param lhs           LHS.
     * @param rhs           RHS.
     * @param scalar        Scalar byte.
     * @return result       Result.
     */
    function eq(bytes32 lhs, bytes memory rhs, bool scalar) internal returns (bytes32 result) {
      bytes1 scalarByte;
      if (scalar) {
          scalarByte = 0x01;
      } else {
          scalarByte = 0x00;
      }
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      result = ITFHEExecutor($.TFHEExecutorAddress).fheEq(lhs, rhs, scalarByte);
  }

  /**
   * @notice              Computes FHENe operation.
   * @param lhs           LHS.
   * @param rhs           RHS.
   * @param scalar        Scalar byte.
   * @return result       Result.
  */
  function ne(bytes32 lhs, bytes memory rhs, bool scalar) internal returns (bytes32 result) {
      bytes1 scalarByte;
      if (scalar) {
          scalarByte = 0x01;
      } else {
          scalarByte = 0x00;
      }
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      result = ITFHEExecutor($.TFHEExecutorAddress).fheNe(lhs, rhs, scalarByte);
  }

    function rand(uint8 randType) internal returns(bytes32 result) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      result = ITFHEExecutor($.TFHEExecutorAddress).fheRand(bytes1(randType));
    }

    function randBounded(uint256 upperBound, uint8 randType) internal returns(bytes32 result) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      result = ITFHEExecutor($.TFHEExecutorAddress).fheRandBounded(upperBound, bytes1(randType));
    }

    /**
     * @notice              Allows the use of handle by address account for this transaction.
     * @dev                 The caller must be allowed to use handle for allowTransient() to succeed.
     *                      If not, allowTransient() reverts.
     *                      The Coprocessor contract can always allowTransient(), contrarily to allow().
     * @param handle        Handle.
     * @param account       Address of the account.
     */
    function allowTransient(bytes32 handle, address account) internal {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      IACL($.ACLAddress).allowTransient(handle, account);
    }


    /**
     * @notice              Allows the use of handle for the address account.
     * @dev                 The caller must be allowed to use handle for allow() to succeed. If not, allow() reverts.
     * @param handle        Handle.
     * @param account       Address of the account.
     */
    function allow(bytes32 handle, address account) internal {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      IACL($.ACLAddress).allow(handle, account);
    }

    /**
     * @dev This function removes the transient allowances in the ACL, which could be useful for integration
     *      with Account Abstraction when bundling several UserOps calling the TFHEExecutorCoprocessor.
     */
    function cleanTransientStorageACL() internal {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      IACL($.ACLAddress).cleanTransientStorage();
    }


    /**
     * @dev This function removes the transient proofs in the InputVerifier, which could be useful for integration 
     *      with Account Abstraction when bundling several UserOps calling the TFHEExecutorCoprocessor.
     */
    function cleanTransientStorageInputVerifier() internal {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      IInputVerifier($.InputVerifierAddress).cleanTransientStorage();
    }


    /**
     * @notice              Returns whether the account is allowed to use the handle, either due to
     *                      allowTransient() or allow().
     * @param handle        Handle.
     * @param account       Address of the account.
     * @return isAllowed    Whether the account can access the handle.
     */
    function isAllowed(bytes32 handle, address account) internal view returns (bool) {
      FHEVMConfigStruct storage $ = getFHEVMConfig();
      return IACL($.ACLAddress).isAllowed(handle, account);
    }
    `;
}

function handleSolidityTFHERand(fheType: FheType): string {
  let res = '';

  if (fheType.supportedOperators.includes('rand')) {
    res += `
    /**
    * @dev Generates a random encrypted value.
    */
    function rand${fheType.type}() internal returns (${fheType.type.toLowerCase()}) {
      return ${fheType.type.toLowerCase()}.wrap(Impl.rand(uint8(Common.FheType.${fheType.isAlias ? fheType.aliasType : fheType.type})));
    }

    `;
  }

  if (fheType.supportedOperators.includes('randBounded')) {
    res += `
    /**
    * @dev Generates a random encrypted ${fheType.bitLength}-bit unsigned integer in the [0, upperBound) range.
    *      The upperBound must be a power of 2.
    */
    function rand${fheType.type}(uint${fheType.bitLength} upperBound) internal returns (${fheType.type.toLowerCase()}) {
      return ${fheType.type.toLowerCase()}.wrap(Impl.randBounded(upperBound, uint8(Common.FheType.${fheType.isAlias ? fheType.aliasType : fheType.type})));
    }

    `;
  }

  return res;
}

/**
 * @description This function is generating the different variants of InputVerifier solidity contracts.
 * @param {boolean} set to true if you want to generate the coprocessor variant, otherwise it will generate the native version
 * @returns {string} the solidity source code
 */
export function generateInputVerifiers(isCoprocessor: boolean): string {
  let output = `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {KMSVerifier} from "./KMSVerifier.sol";
import {TFHEExecutor} from "./TFHEExecutor.sol";
import {kmsVerifierAdd} from "../addresses/KMSVerifierAddress.sol";\n`;
  if (isCoprocessor) {
    output += `import {coprocessorAdd} from "../addresses/CoprocessorAddress.sol";\n`;
  }

  output += `\n// Importing OpenZeppelin contracts for cryptographic signature verification and access control.
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";\n`;
  if (isCoprocessor) {
    output += `import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";\n`;
  }

  output += `
/**
* @title    InputVerifier.
* @notice   This contract allows signature verification of user encrypted inputs.\n`;
  if (isCoprocessor) {
    output += `*           This version is only for the Coprocessor version of the fhEVM.\n`;
  } else {
    output += `*           This version is only for the native version of the fhEVM.\n`;
  }

  output += `*           This contract is called by the TFHEExecutor inside verifyCiphertext function, and calls the KMSVerifier to fetch KMS signer addresses.\n`;
  if (isCoprocessor) {
    output += `* @dev      The contract uses OpenZeppelin's EIP712Upgradeable for cryptographic operations.
*/
contract InputVerifier is UUPSUpgradeable, Ownable2StepUpgradeable, EIP712Upgradeable {
`;
  } else {
    output += `
*/
    contract InputVerifier is UUPSUpgradeable, Ownable2StepUpgradeable {\n`;
  }

  output += `
    /// @notice Returned if the deserializing of the input proof fails.
    error DeserializingInputProofFail();

    /// @notice Returned if the input proof is empty.
    error EmptyInputProof();

    /// @notice Returned if the index is invalid.
    error InvalidIndex();

    /// @notice Returned if the input handle is wrong.
    error InvalidInputHandle();

    /// @notice Returned if the handle version is not the correct one.
    error InvalidHandleVersion();
    
    `;

  if (isCoprocessor) {
    output += `
    /// @notice Returned if the number of EIP712 KMS signature is not sufficient.
    error KMSNumberSignaturesInsufficient();

    /// @notice Returned if the recovered signer address is not the coprocessor address.
    error SignerIsNotCoprocessor();

    /// @param aclAddress       ACL address.
    /// @param hashOfCiphertext Hash of ciphertext.
    /// @param handlesList      List of handles.
    /// @param userAddress      Address of the user.
    /// @param contractAddress  Contract address.
    struct CiphertextVerificationForCopro {
        address aclAddress;
        bytes32 hashOfCiphertext;
        uint256[] handlesList;
        address userAddress;
        address contractAddress;
    }
`;
  } else {
    output += `
    /// @notice Returned if the input proof handle is wrong.
    error InvalidInputProofHandle();

    /// @notice Returned if the serialized handle index is invalid.
    error InvalidSerializedHandleIndex();

    /// @notice Returned if the number of EIP712 KMS signature is not sufficient.
    error KMSNumberSignaturesInsufficient();
`;
  }

  output += `

    /// @notice Handle version.
    uint8 public constant HANDLE_VERSION = 0;

    /// @notice KMSVerifier.
    KMSVerifier public constant kmsVerifier = KMSVerifier(kmsVerifierAdd);

    /// @notice Name of the contract.
    string private constant CONTRACT_NAME = "InputVerifier";
`;

  if (isCoprocessor) {
    output += `
    /// @notice Ciphertext verification type.
    string public constant CIPHERTEXT_VERIFICATION_COPRO_TYPE =
        "CiphertextVerificationForCopro(address aclAddress,bytes32 hashOfCiphertext,uint256[] handlesList,address userAddress,address contractAddress)";

    /// @notice Ciphertext verification typehash.
    bytes32 public constant CIPHERTEXT_VERIFICATION_COPRO_TYPEHASH =
        keccak256(bytes(CIPHERTEXT_VERIFICATION_COPRO_TYPE));

    /// @notice Coprocessor address.
    address private constant coprocessorAddress = coprocessorAdd;
    `;
  }

  output += `
    /// @notice Major version of the contract.
    uint256 private constant MAJOR_VERSION = 0;

    /// @notice Minor version of the contract.
    uint256 private constant MINOR_VERSION = 1;

    /// @notice Patch version of the contract.
    uint256 private constant PATCH_VERSION = 0;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
  `;

  if (isCoprocessor) {
    output += `
    /**
     * @notice  Re-initializes the contract.
     */
    function reinitialize() public reinitializer(2) {
        __EIP712_init(CONTRACT_NAME, "1");
    }
    `;
  }

  output += `

    /**
     * @dev This function removes the transient allowances, which could be useful for
            integration with Account Abstraction when bundling several UserOps calling InputVerifier.
     */
    function cleanTransientStorage() public virtual {
        assembly {
            let length := tload(0)
            tstore(0, 0)
            let lengthPlusOne := add(length, 1)
            for {
                let i := 1
            } lt(i, lengthPlusOne) {
                i := add(i, 1)
            } {
                let handle := tload(i)
                tstore(i, 0)
                tstore(handle, 0)
            }
        }
    }

    /**
     * @notice              Verifies the ciphertext.
     * @param context       Context user inputs.
     * @param inputHandle   Input handle.
     * @param inputProof    Input proof.
     * @return result       Result.
     */
    function verifyCiphertext(
        TFHEExecutor.ContextUserInputs memory context,
        bytes32 inputHandle,
        bytes memory inputProof
    ) public virtual returns (uint256) {
        (bool isProofCached, bytes32 cacheKey) = _checkProofCache(
            inputProof,
            context.userAddress,
            context.contractAddress,
            context.aclAddress
        );
        uint256 result = uint256(inputHandle);
        uint256 indexHandle = (result & 0x0000000000000000000000000000000000000000000000000000000000ff0000) >> 16;
  `;

  if (isCoprocessor) {
    output += `

    if (!isProofCached) {
        /// @dev bundleCiphertext is compressedPackedCT+ZKPOK
        ///      inputHandle is keccak256(keccak256(bundleCiphertext)+index)[0:29]+index+type+version
        ///      and inputProof is len(list_handles) + numSignersKMS + hashCT + list_handles +
        ///      signatureCopro + signatureKMSSigners (1+1+32+NUM_HANDLES*32+65+65*numSignersKMS)

        uint256 inputProofLen = inputProof.length;
        if (inputProofLen == 0) revert EmptyInputProof();
        uint256 numHandles = uint256(uint8(inputProof[0]));
        uint256 numSignersKMS = uint256(uint8(inputProof[1]));

        /// @dev This checks in particular that the list is non-empty.
        if (numHandles <= indexHandle) revert InvalidIndex();
        if (inputProofLen != 99 + 32 * numHandles + 65 * numSignersKMS) revert DeserializingInputProofFail();

        bytes32 hashCT;

        assembly {
            hashCT := mload(add(inputProof, 34))
        }

        /// @dev Deserialize handle and check that they are from the correct version.
        uint256[] memory listHandles = new uint256[](numHandles);
        for (uint256 i = 0; i < numHandles; i++) {
            uint256 element;
            assembly {
                element := mload(add(inputProof, add(66, mul(i, 32))))
            }
            /// @dev Check that all handles are from the correct version.
            if (uint8(element) != HANDLE_VERSION) revert InvalidHandleVersion();
            listHandles[i] = element;
        }

        {
            bytes memory signatureCoproc = new bytes(65);
            for (uint256 i = 0; i < 65; i++) {
                signatureCoproc[i] = inputProof[34 + 32 * numHandles + i];
            }
            CiphertextVerificationForCopro memory cvCopro;
            cvCopro.aclAddress = context.aclAddress;
            cvCopro.hashOfCiphertext = hashCT;
            cvCopro.handlesList = listHandles;
            cvCopro.userAddress = context.userAddress;
            cvCopro.contractAddress = context.contractAddress;
            _verifyEIP712Copro(cvCopro, signatureCoproc);
        }
    `;
  } else {
    output += `
    if (!isProofCached) {
    /// @dev bundleCiphertext is compressedPackedCT+ZKPOK
    ///      inputHandle is keccak256(keccak256(bundleCiphertext)+index)[0:29]+index+type+version
    ///      and inputProof is len(list_handles) + numSignersKMS + list_handles + signatureKMSSigners +
    ///      bundleCiphertext (1+1+NUM_HANDLES*32+65*numSignersKMS+bundleCiphertext.length)

    uint256 inputProofLen = inputProof.length;
    if (inputProofLen == 0) revert EmptyInputProof();
    uint256 numHandles = uint256(uint8(inputProof[0]));
    uint256 numSignersKMS = uint256(uint8(inputProof[1]));

    /// @dev This checks in particular that the list is non-empty.
    if (numHandles <= indexHandle) revert InvalidIndex();
    /// @dev On native, if an invalid indexHandle above the "real" numHandles is passed, it will be mapped to a trivialEncrypt(0) by backend.
    if (inputProofLen <= 2 + 32 * numHandles + 65 * numSignersKMS) revert DeserializingInputProofFail();

    bytes32 hashCT;

    {
        uint256 prefixLength = 2 + 32 * numHandles + 65 * numSignersKMS;
        uint256 bundleCiphertextLength = inputProofLen - prefixLength;
        bytes memory bundleCiphertext = new bytes(bundleCiphertextLength);
        for (uint256 i = 0; i < bundleCiphertextLength; i++) {
            bundleCiphertext[i] = inputProof[prefixLength + i];
        }
        hashCT = keccak256(bundleCiphertext);
    }
     `;
  }

  output += `
  {
    bytes[] memory signaturesKMS = new bytes[](numSignersKMS);
    for (uint256 j = 0; j < numSignersKMS; j++) {
        signaturesKMS[j] = new bytes(65);
        for (uint256 i = 0; i < 65; i++) {
`;

  if (isCoprocessor) {
    output += `
  signaturesKMS[j][i] = inputProof[99 + 32 * numHandles + 65 * j + i];
`;
  } else {
    output += `
    signaturesKMS[j][i] = inputProof[2 + 32 * numHandles + 65 * j + i];
  `;
  }

  output += `
        }
    }
    KMSVerifier.CiphertextVerificationForKMS memory cvKMS;
    cvKMS.aclAddress = context.aclAddress;
    cvKMS.hashOfCiphertext = hashCT;
    cvKMS.userAddress = context.userAddress;
    cvKMS.contractAddress = context.contractAddress;
    bool kmsCheck = kmsVerifier.verifyInputEIP712KMSSignatures(cvKMS, signaturesKMS);
    if (!kmsCheck) revert KMSNumberSignaturesInsufficient();
}

  `;

  if (isCoprocessor) {
    output += `
    _cacheProof(cacheKey);
    if (result != listHandles[indexHandle]) revert InvalidInputHandle();
    `;
  } else {
    output += `

    /// @dev Deserialize handle and check they are from the correct version and correct values
    ///     (handles are recomputed onchain in native case).
    for (uint256 i = 0; i < numHandles; i++) {
        uint256 element;
        assembly {
            element := mload(add(inputProof, add(34, mul(i, 32))))
        }
        /// @dev Check all handles are from correct version.
        if (uint8(element) != HANDLE_VERSION) revert InvalidHandleVersion();
        uint256 indexElement = (element & 0x0000000000000000000000000000000000000000000000000000000000ff0000) >>
            16;

        if (indexElement != i) revert InvalidSerializedHandleIndex();

        uint256 recomputedHandle = uint256(keccak256(abi.encodePacked(hashCT, uint8(i))));

        if (
            (recomputedHandle & 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000) !=
            (element & 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000)
        ) revert InvalidInputProofHandle();

        /// @dev Only the before last byte corresponding to type, ie element[30] could not be checked,
        ///      i.e on native type is malleable, this means it will be casted accordingly by the backend
        ///      (or trivialEncrypt(0) if index is invalid).
        if (i == indexHandle) {
            if (element != result) revert InvalidInputHandle();
        }
    }

    _cacheProof(cacheKey);

    `;
  }

  output += `
    } else {
        uint8 numHandles = uint8(inputProof[0]);
        /// @dev We know inputProof is non-empty since it has been previously cached.
        if (numHandles <= indexHandle) revert InvalidIndex();
        uint256 element;
        for (uint256 j = 0; j < 32; j++) {
`;

  if (isCoprocessor) {
    output += ` 
    element |= uint256(uint8(inputProof[34 + indexHandle * 32 + j])) << (8 * (31 - j));
    `;
  } else {
    output += ` 
    element |= uint256(uint8(inputProof[2 + indexHandle * 32 + j])) << (8 * (31 - j));
    `;
  }

  output += `
        }
        if (element != result) revert InvalidInputHandle();
    }
    return result;
    }
`;

  if (isCoprocessor) {
    output += `

    /**
     * @notice Getter function for the Coprocessor account address.
     */
        function getCoprocessorAddress() public view virtual returns (address) {
            return coprocessorAddress;
        }
    `;
  }

  output += `

    /**
     * @notice Getter function for the KMSVerifier contract address.
     */
    function getKMSVerifierAddress() public view virtual returns (address) {
        return address(kmsVerifier);
    }

    /**
     * @notice        Getter for the name and version of the contract.
     * @return string Name and the version of the contract.
     */
    function getVersion() external pure virtual returns (string memory) {
        return
            string(
                abi.encodePacked(
                    CONTRACT_NAME,
                    " v",
                    Strings.toString(MAJOR_VERSION),
                    ".",
                    Strings.toString(MINOR_VERSION),
                    ".",
                    Strings.toString(PATCH_VERSION)
                )
            );
    }

    function _cacheProof(bytes32 proofKey) internal virtual {
        assembly {
            tstore(proofKey, 1)
            let length := tload(0)
            let lengthPlusOne := add(length, 1)
            tstore(lengthPlusOne, proofKey)
            tstore(0, lengthPlusOne)
        }
    }

    function _checkProofCache(
        bytes memory inputProof,
        address userAddress,
        address contractAddress,
        address aclAddress
    ) internal view virtual returns (bool, bytes32) {
        bool isProofCached;
        bytes32 key = keccak256(abi.encodePacked(contractAddress, aclAddress, userAddress, inputProof));
        assembly {
            isProofCached := tload(key)
        }
        return (isProofCached, key);
    }
    `;

  if (isCoprocessor) {
    output += `
    function _hashCiphertextVerificationForCopro(
        CiphertextVerificationForCopro memory CVcopro
    ) internal view virtual returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        CIPHERTEXT_VERIFICATION_COPRO_TYPEHASH,
                        CVcopro.aclAddress,
                        CVcopro.hashOfCiphertext,
                        keccak256(abi.encodePacked(CVcopro.handlesList)),
                        CVcopro.userAddress,
                        CVcopro.contractAddress
                    )
                )
            );
    }

    function _verifyEIP712Copro(
        CiphertextVerificationForCopro memory cv,
        bytes memory signature
    ) internal view virtual {
        bytes32 digest = _hashCiphertextVerificationForCopro(cv);
        address signer = ECDSA.recover(digest, signature);
        if (signer != coprocessorAddress) revert SignerIsNotCoprocessor();
    }
    `;
  }

  output += `

    /**
     * @dev Should revert when msg.sender is not authorized to upgrade the contract.
     */
      function _authorizeUpgrade(address _newImplementation) internal virtual override onlyOwner {}
    }
    `;

  return output;
}

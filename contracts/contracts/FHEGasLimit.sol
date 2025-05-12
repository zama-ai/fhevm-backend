// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {fhevmExecutorAdd} from "../addresses/FHEVMExecutorAddress.sol";

import {FheType} from "./FheType.sol";

/**
 * @title  FHEGasLimit
 * @notice This contract manages the amount of gas to be paid for FHE operations.
 */
contract FHEGasLimit is UUPSUpgradeable, Ownable2StepUpgradeable {
    /// @notice Returned if the sender is not the FHEVMExecutor.
    error CallerMustBeFHEVMExecutorContract();

    /// @notice Returned if the block limit is higher than limit for FHE operation.
    error FHEGasBlockLimitExceeded();

    /// @notice Returned if the transaction limit is higher than limit for FHE operation.
    error FHEGasTransactionLimitExceeded();

    /// @notice Returned if the operation is not supported.
    error UnsupportedOperation();

    /// @notice Returned if the operation is not scalar.
    error OnlyScalarOperationsAreSupported();

    /// @notice Name of the contract.
    string private constant CONTRACT_NAME = "FHEGasLimit";

    /// @notice Major version of the contract.
    uint256 private constant MAJOR_VERSION = 0;

    /// @notice Minor version of the contract.
    uint256 private constant MINOR_VERSION = 1;

    /// @notice Patch version of the contract.
    uint256 private constant PATCH_VERSION = 0;

    /// @notice FHEVMExecutor address.
    address private constant fhevmExecutorAddress = fhevmExecutorAdd;

    /// @notice FHE gas block limit.
    uint256 private constant FHE_GAS_BLOCKLIMIT = 20_000_000;

    /// @notice FHE gas transaction limit.
    uint256 private constant FHE_GAS_TRANSACTION_LIMIT = 5_000_000;

    /// @custom:storage-location erc7201:fhevm.storage.FHEGasLimit
    struct FHEGasLimitStorage {
        uint256 lastBlock;
        uint256 currentBlockConsumption;
    }

    /// keccak256(abi.encode(uint256(keccak256("fhevm.storage.FHEGasLimit")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant FHEGasLimitStorageLocation =
        0xb5c80b3bbe0bcbcea690f6dbe62b32a45bd1ad263b78db2f25ef8414efe9bc00;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Re-initializes the contract.
     */
    /// @custom:oz-upgrades-validate-as-initializer
    function reinitialize() public virtual reinitializer(2) {
        __Ownable_init(owner());
    }

    /**
     * @notice Computes the gas required for FheAdd.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheAdd(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 94_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 162_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 188_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 218_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 94_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 162_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 188_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 218_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheSub.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheSub(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;

        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 94_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 162_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 188_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 218_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 94_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 162_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 188_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 218_000;
            } else {
                revert UnsupportedOperation();
            }
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheMul.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheMul(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 159_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 208_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 264_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 356_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 480_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 197_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 262_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 359_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 641_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 1145_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheDiv.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheDiv(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte != 0x01) revert OnlyScalarOperationsAreSupported();
        if (resultType == FheType.Uint8) {
            fheGas = 238_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 314_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 398_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 584_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 857_000;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheRem.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheRem(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte != 0x01) revert OnlyScalarOperationsAreSupported();
        if (resultType == FheType.Uint8) {
            fheGas = 460_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 622_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 805_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 1095_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 1_499_000;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheBitAnd.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheBitAnd(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;

        if (scalarByte == 0x01) {
            if (resultType == FheType.Bool) {
                fheGas = 26_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Bool) {
                fheGas = 26_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheBitOr.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheBitOr(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Bool) {
                fheGas = 26_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Bool) {
                fheGas = 26_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheBitXor.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheBitXor(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Bool) {
                fheGas = 26_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Bool) {
                fheGas = 26_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 34_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheShl.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheShl(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 153_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 183_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 227_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 282_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 350_000;
            } else {
                revert UnsupportedOperation();
            }
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheShr.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheShr(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 153_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 183_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 227_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 282_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 350_000;
            } else {
                revert UnsupportedOperation();
            }
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheRotl.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheRotl(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;

        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 153_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 183_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 227_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 282_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 350_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheRotr.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheRotr(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;

        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 35_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 38_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 41_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 44_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 133_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 153_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 183_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 227_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 282_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 350_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheEq.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param result Result of the operation.
     * @dev Rhs is not relevant for fheGas calculation.
     */
    function checkGasLimitForFheEqBytes(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas = _checkTypeAndReturnGasForFheEq(resultType, scalarByte);
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitUnaryOp(fheGas, result, lhs);
    }

    /**
     * @notice Computes the gas required for FheEq.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheEq(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas = _checkTypeAndReturnGasForFheEq(resultType, scalarByte);
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheNe.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheNe(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas = _checkTypeAndReturnGasForFheNe(resultType, scalarByte);
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheNe.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param result Result of the operation.
     * @dev Rhs is not relevant for fheGas calculation.
     */
    function checkGasLimitForFheNeBytes(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas = _checkTypeAndReturnGasForFheNe(resultType, scalarByte);
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitUnaryOp(fheGas, result, lhs);
    }

    /**
     * @notice Computes the gas required for FheGe.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheGe(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheGt.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheGt(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;

        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheLe.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheLe(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheLt.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheLt(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 105_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 156_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 190_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheMin.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheMin(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 150_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 164_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 192_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 225_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 153_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 183_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 210_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 241_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheMax.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     * @param lhs Left-hand side operand.
     * @param rhs Right-hand side operand.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheMax(
        FheType resultType,
        bytes1 scalarByte,
        bytes32 lhs,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (scalarByte == 0x01) {
            if (resultType == FheType.Uint8) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 150_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 164_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 192_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 225_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Uint8) {
                fheGas = 128_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 153_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 183_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 210_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 241_000;
            } else {
                revert UnsupportedOperation();
            }
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitBinaryOp(fheGas, result, lhs, rhs);
    }

    /**
     * @notice Computes the gas required for FheNeg.
     * @param resultType Result type.
     * @param ct Ciphertext.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheNeg(FheType resultType, bytes32 ct, bytes32 result) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Uint8) {
            fheGas = 95_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 131_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 160_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 199_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 248_000;
        } else if (resultType == FheType.Uint256) {
            fheGas = 309_000;
        } else {
            revert UnsupportedOperation();
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitUnaryOp(fheGas, result, ct);
    }

    /**
     * @notice              Computes the gas required for FheNot.
     * @param resultType    Result type.
     */
    function checkGasLimitForFheNot(FheType resultType, bytes32 ct, bytes32 result) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Bool) {
            fheGas = 30_000;
        } else if (resultType == FheType.Uint8) {
            fheGas = 34_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 35_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 36_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 37_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 38_000;
        } else if (resultType == FheType.Uint256) {
            fheGas = 39_000;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitUnaryOp(fheGas, result, ct);
    }

    /**
     * @notice              Computes the gas required for Cast.
     * @param resultType    Result type.
     */
    function checkGasLimitForCast(FheType resultType, bytes32 ct, bytes32 result) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Bool) {
            fheGas = 200;
        } else if (resultType == FheType.Uint8) {
            fheGas = 200;
        } else if (resultType == FheType.Uint16) {
            fheGas = 200;
        } else if (resultType == FheType.Uint32) {
            fheGas = 200;
        } else if (resultType == FheType.Uint64) {
            fheGas = 200;
        } else if (resultType == FheType.Uint128) {
            fheGas = 200;
        } else if (resultType == FheType.Uint256) {
            fheGas = 200;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitUnaryOp(fheGas, result, ct);
    }

    /**
     * @notice              Computes the gas required for TrivialEncrypt.
     * @param resultType    Result type.
     */
    function checkGasLimitForTrivialEncrypt(FheType resultType, bytes32 result) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Bool) {
            fheGas = 100;
        } else if (resultType == FheType.Uint8) {
            fheGas = 100;
        } else if (resultType == FheType.Uint16) {
            fheGas = 200;
        } else if (resultType == FheType.Uint32) {
            fheGas = 300;
        } else if (resultType == FheType.Uint64) {
            fheGas = 600;
        } else if (resultType == FheType.Uint128) {
            fheGas = 650;
        } else if (resultType == FheType.Uint160) {
            fheGas = 700;
        } else if (resultType == FheType.Uint256) {
            fheGas = 800;
        } else if (resultType == FheType.Uint512) {
            fheGas = 1600;
        } else if (resultType == FheType.Uint1024) {
            fheGas = 3200;
        } else if (resultType == FheType.Uint2048) {
            fheGas = 6400;
        } else {
            revert UnsupportedOperation();
        }
        _adjustAndCheckFheBlockConsumption(fheGas);
        _setFheGasForHandle(result, fheGas);
    }

    /**
     * @notice              Computes the gas required for IfThenElse.
     * @param resultType    Result type.
     */
    function checkGasLimitForIfThenElse(
        FheType resultType,
        bytes32 lhs,
        bytes32 middle,
        bytes32 rhs,
        bytes32 result
    ) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Bool) {
            fheGas = 43_000;
        } else if (resultType == FheType.Uint8) {
            fheGas = 47_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 47_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 50_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 53_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 70_000;
        } else if (resultType == FheType.Uint160) {
            fheGas = 80_000;
        } else if (resultType == FheType.Uint256) {
            fheGas = 90_000;
        } else if (resultType == FheType.Uint512) {
            fheGas = 150_000;
        } else if (resultType == FheType.Uint1024) {
            fheGas = 200_000;
        } else if (resultType == FheType.Uint2048) {
            fheGas = 300_000;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _adjustAndCheckFheTransactionLimitTernaryOp(fheGas, result, lhs, middle, rhs);
    }

    /**
     * @notice Computes the gas required for FheRand.
     * @param resultType Result type.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheRand(FheType resultType, bytes32 result) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Bool) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint8) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint256) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint512) {
            fheGas = 200_000;
        } else if (resultType == FheType.Uint1024) {
            fheGas = 300_000;
        } else if (resultType == FheType.Uint2048) {
            fheGas = 400_000;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _setFheGasForHandle(result, fheGas);
    }

    /**
     * @notice Computes the gas required for FheRandBounded.
     * @param resultType Result type.
     * @param result Result of the operation.
     */
    function checkGasLimitForFheRandBounded(FheType resultType, bytes32 result) external virtual {
        if (msg.sender != fhevmExecutorAddress) revert CallerMustBeFHEVMExecutorContract();
        _checkIfNewBlock();
        uint256 fheGas;
        if (resultType == FheType.Uint8) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint16) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint32) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint64) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint128) {
            fheGas = 100_000;
        } else if (resultType == FheType.Uint256) {
            fheGas = 100_000;
        } else {
            revert UnsupportedOperation();
        }

        _adjustAndCheckFheBlockConsumption(fheGas);
        _setFheGasForHandle(result, fheGas);
    }

    /**
     * @notice Getter function for the FHEVMExecutor contract address.
     * @return fhevmExecutorAddress Address of the FHEVMExecutor.
     */
    function getFHEVMExecutorAddress() public view virtual returns (address) {
        return fhevmExecutorAddress;
    }

    /**
     * @notice Getter for the name and version of the contract.
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

    /**
     * @dev Checks if it is a new block. If so, it resets information for new block.
     */
    function _checkIfNewBlock() internal virtual {
        FHEGasLimitStorage storage $ = _getFHEGasLimitStorage();
        uint256 lastBlock_ = block.number;
        if (lastBlock_ > $.lastBlock) {
            $.lastBlock = lastBlock_;
            $.currentBlockConsumption = 0;
        }
    }

    /**
     * @notice Updates the current FHE gas consumption for the transaction.
     * @param fheGas The FHE gas to be added.
     * @param result The result of the operation.
     * @param lhs The only operand.
     */
    function _adjustAndCheckFheTransactionLimitUnaryOp(uint256 fheGas, bytes32 result, bytes32 lhs) internal {
        uint256 txFheGasSpent = fheGas + _getFheGasForHandle(lhs);
        if (txFheGasSpent >= FHE_GAS_TRANSACTION_LIMIT) {
            revert FHEGasTransactionLimitExceeded();
        }

        _setFheGasForHandle(result, txFheGasSpent);
    }

    /**
     * @notice Updates the current FHE gas consumption for the transaction.
     * @param fheGas The FHE gas to be added.
     * @param result The result of the operation.
     * @param lhs The left-hand side operand.
     * @param rhs The right-hand side operand.
     */
    function _adjustAndCheckFheTransactionLimitBinaryOp(
        uint256 fheGas,
        bytes32 result,
        bytes32 lhs,
        bytes32 rhs
    ) internal {
        uint256 txFheGasSpent = fheGas + _max(_getFheGasForHandle(lhs), _getFheGasForHandle(rhs));
        if (txFheGasSpent >= FHE_GAS_TRANSACTION_LIMIT) {
            revert FHEGasTransactionLimitExceeded();
        }

        _setFheGasForHandle(result, txFheGasSpent);
    }

    /**
     * @notice Updates the current FHE gas consumption for the transaction.
     * @param fheGas The FHE gas to be added.
     * @param result The result of the operation.
     * @param lhs The left-hand side operand.
     * @param middle The middle operand.
     * @param rhs The right-hand side operand.
     */
    function _adjustAndCheckFheTransactionLimitTernaryOp(
        uint256 fheGas,
        bytes32 result,
        bytes32 lhs,
        bytes32 middle,
        bytes32 rhs
    ) internal {
        uint256 txFheGasSpent = fheGas +
            _max(_getFheGasForHandle(lhs), _max(_getFheGasForHandle(middle), _getFheGasForHandle(rhs)));

        console.log(txFheGasSpent);

        if (txFheGasSpent >= FHE_GAS_TRANSACTION_LIMIT) {
            revert FHEGasTransactionLimitExceeded();
        }

        _setFheGasForHandle(result, txFheGasSpent);
    }

    /**
     * @dev Checks if the FHE gas limit for the block is exceeded.
     * @param paidAmountGas Paid amount gas.
     */
    function _adjustAndCheckFheBlockConsumption(uint256 paidAmountGas) internal virtual {
        FHEGasLimitStorage storage $ = _getFHEGasLimitStorage();
        $.currentBlockConsumption += paidAmountGas;

        if ($.currentBlockConsumption >= FHE_GAS_BLOCKLIMIT) revert FHEGasBlockLimitExceeded();
    }

    /**
     * @notice Sets the FHE gas for a given handle in the transient storage.
     * @param handle The handle for which to set the FHE gas.
     */
    function _setFheGasForHandle(bytes32 handle, uint256 handleFheGas) internal {
        bytes32 slot = keccak256(abi.encodePacked(FHEGasLimitStorageLocation, handle));
        assembly {
            tstore(slot, handleFheGas)
        }
    }

    /**
     * @notice Updates the current FHE gas consumption for the block.
     * @param handle The handle for which to get the FHE gas.
     */
    function _getFheGasForHandle(bytes32 handle) internal view returns (uint256 handleFheGas) {
        bytes32 slot = keccak256(abi.encodePacked(FHEGasLimitStorageLocation, handle));
        assembly {
            handleFheGas := tload(slot)
        }
    }

    /**
     * @dev Should revert when msg.sender is not authorized to upgrade the contract.
     */
    function _authorizeUpgrade(address _newImplementation) internal virtual override onlyOwner {}

    /**
     * @dev Returns the FHEGasLimit storage location.
     */
    function _getFHEGasLimitStorage() internal pure returns (FHEGasLimitStorage storage $) {
        assembly {
            $.slot := FHEGasLimitStorageLocation
        }
    }

    /**
     * @notice Computes the gas required for FheEq.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     */
    function _checkTypeAndReturnGasForFheEq(
        FheType resultType,
        bytes1 scalarByte
    ) private pure returns (uint256 fheGas) {
        if (scalarByte == 0x01) {
            if (resultType == FheType.Bool) {
                fheGas = 49_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 53_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 54_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 86_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 88_000;
            } else if (resultType == FheType.Uint160) {
                fheGas = 90_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 100_000;
            } else if (resultType == FheType.Uint512) {
                fheGas = 150_000;
            } else if (resultType == FheType.Uint1024) {
                fheGas = 200_000;
            } else if (resultType == FheType.Uint2048) {
                fheGas = 300_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Bool) {
                fheGas = 49_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 53_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 54_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 86_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 88_000;
            } else if (resultType == FheType.Uint160) {
                fheGas = 90_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 100_000;
            } else if (resultType == FheType.Uint512) {
                fheGas = 150_000;
            } else if (resultType == FheType.Uint1024) {
                fheGas = 200_000;
            } else if (resultType == FheType.Uint2048) {
                fheGas = 300_000;
            } else {
                revert UnsupportedOperation();
            }
        }
    }

    /**
     * @notice Computes the gas required for FheNe.
     * @param resultType Result type.
     * @param scalarByte Scalar byte.
     */
    function _checkTypeAndReturnGasForFheNe(
        FheType resultType,
        bytes1 scalarByte
    ) private pure returns (uint256 fheGas) {
        if (scalarByte == 0x01) {
            if (resultType == FheType.Bool) {
                fheGas = 49_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 53_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 54_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 86_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 88_000;
            } else if (resultType == FheType.Uint160) {
                fheGas = 90_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 100_000;
            } else if (resultType == FheType.Uint512) {
                fheGas = 150_000;
            } else if (resultType == FheType.Uint1024) {
                fheGas = 200_000;
            } else if (resultType == FheType.Uint2048) {
                fheGas = 300_000;
            } else {
                revert UnsupportedOperation();
            }
        } else {
            if (resultType == FheType.Bool) {
                fheGas = 49_000;
            } else if (resultType == FheType.Uint8) {
                fheGas = 53_000;
            } else if (resultType == FheType.Uint16) {
                fheGas = 54_000;
            } else if (resultType == FheType.Uint32) {
                fheGas = 82_000;
            } else if (resultType == FheType.Uint64) {
                fheGas = 86_000;
            } else if (resultType == FheType.Uint128) {
                fheGas = 88_000;
            } else if (resultType == FheType.Uint160) {
                fheGas = 90_000;
            } else if (resultType == FheType.Uint256) {
                fheGas = 100_000;
            } else if (resultType == FheType.Uint512) {
                fheGas = 150_000;
            } else if (resultType == FheType.Uint1024) {
                fheGas = 200_000;
            } else if (resultType == FheType.Uint2048) {
                fheGas = 300_000;
            } else {
                revert UnsupportedOperation();
            }
        }
    }

    /**
     * @dev Returns the maximum of two numbers.
     * @param a The first number.
     * @param b The second number.
     * @return The maximum of a and b.
     */
    function _max(uint256 a, uint256 b) private pure returns (uint256) {
        return a >= b ? a : b;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UnsafeUpgrades} from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {FheType} from "../../contracts/FheType.sol";
import {FHEGasLimit} from "../../contracts/FHEGasLimit.sol";
import {EmptyUUPSProxy} from "../../contracts/emptyProxy/EmptyUUPSProxy.sol";
import {fhevmExecutorAdd} from "../../addresses/FHEVMExecutorAddress.sol";
import {SupportedTypesConstants} from "../fhevmExecutor/fhevmExecutor.t.sol";

contract MockFheGasLimit is FHEGasLimit {
    /// @dev This function allows reading the current block consumption from the storage.
    function getCurrentBlockConsumption() public view returns (uint256) {
        FHEGasLimitStorage storage $ = _getFHEGasLimitStorage();
        return $.currentBlockConsumption;
    }

    /// @dev This function is used for testing purposes to increase the paidAmountGas (for checking revertion paths).
    function updateFunding(uint256 paidAmountGas) public {
        _checkIfNewBlock();
        _adjustAndCheckFheBlockConsumption(paidAmountGas);
    }
}

contract FHEGasLimitTest is Test, SupportedTypesConstants {
    MockFheGasLimit internal fheGasLimit;

    address internal constant owner = address(456);

    address internal proxy;
    address internal implementation;
    address internal fhevmExecutor;

    uint256 internal FHE_GAS_BLOCKLIMIT = 20_000_000 - 1;

    bytes32 mockLHS;
    bytes32 mockRHS;
    bytes32 mockMiddle;
    bytes32 mockResult;

    function _isTypeSupported(FheType fheType, uint256 supportedTypes) internal pure returns (bool) {
        if ((1 << uint8(fheType)) & supportedTypes == 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @dev Sets up the testing environment by deploying a proxy contract and initializing signers.
     * This function is executed before each test to ensure a consistent and isolated state.
     */
    function setUp() public {
        /// @dev It uses UnsafeUpgrades for measuring code coverage.
        proxy = UnsafeUpgrades.deployUUPSProxy(
            address(new EmptyUUPSProxy()),
            abi.encodeCall(EmptyUUPSProxy.initialize, owner)
        );

        implementation = address(new MockFheGasLimit());
        UnsafeUpgrades.upgradeProxy(proxy, implementation, abi.encodeCall(fheGasLimit.reinitialize, ()), owner);
        fheGasLimit = MockFheGasLimit(proxy);
        fhevmExecutor = fheGasLimit.getFHEVMExecutorAddress();
    }

    /**
     * @dev Tests that the post-upgrade check for the proxy contract works as expected.
     * It checks that the version is correct and the owner is set to the expected address.
     */
    function test_PostProxyUpgradeCheck() public view {
        assertEq(fheGasLimit.getVersion(), string(abi.encodePacked("FHEGasLimit v0.1.0")));
        assertEq(fheGasLimit.owner(), owner);
        assertEq(fheGasLimit.getFHEVMExecutorAddress(), fhevmExecutorAdd);
    }

    function test_checkGasLimitForFheAddWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheAdd));

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheAdd(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);

        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 94000);
        vm.assertLe(currentBlockConsumption, 218000);
    }

    function test_PayFheSubWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheSub));

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheSub(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);

        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 94000);
        vm.assertLe(currentBlockConsumption, 218000);
    }

    function test_PayFheMulWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheMul));

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheMul(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 159000);
            vm.assertLe(currentBlockConsumption, 480000);
        } else {
            vm.assertGe(currentBlockConsumption, 197000);
            vm.assertLe(currentBlockConsumption, 1145000);
        }
    }

    function test_PayFheDivWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheDiv));
        bytes1 scalarByte = 0x01;

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheDiv(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 238000);
        vm.assertLe(currentBlockConsumption, 857000);
    }

    function test_PayFheRemWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRem));
        bytes1 scalarByte = 0x01;

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRem(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 460000);
        vm.assertLe(currentBlockConsumption, 1499000);
    }

    function test_checkGasLimitForFheBitAndWorksAsExpectedForSupportedTypes(
        uint8 resultType,
        bytes1 scalarByte
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheBitAnd));

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheBitAnd(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 26000);
        vm.assertLe(currentBlockConsumption, 44000);
    }

    function test_checkGasLimitForFheBitOrWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheBitOr));

        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheBitOr(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 26000);
        vm.assertLe(currentBlockConsumption, 44000);
    }

    function test_PayFheBitXorWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheBitXor));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheBitXor(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 26000);
        vm.assertLe(currentBlockConsumption, 44000);
    }

    function test_checkGasLimitForFheShlWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheShl));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheShl(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 35000);
            vm.assertLe(currentBlockConsumption, 44000);
        } else {
            vm.assertGe(currentBlockConsumption, 133000);
            vm.assertLe(currentBlockConsumption, 350000);
        }
    }

    function test_checkGasLimitForFheShrWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheShr));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheShr(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 35000);
            vm.assertLe(currentBlockConsumption, 44000);
        } else {
            vm.assertGe(currentBlockConsumption, 133000);
            vm.assertLe(currentBlockConsumption, 350000);
        }
    }

    function test_checkGasLimitForFheRotlWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRotl));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRotl(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 35000);
            vm.assertLe(currentBlockConsumption, 44000);
        } else {
            vm.assertGe(currentBlockConsumption, 133000);
            vm.assertLe(currentBlockConsumption, 350000);
        }
    }
    function test_checkGasLimitForFheRotrWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRotr));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRotr(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 35000);
            vm.assertLe(currentBlockConsumption, 44000);
        } else {
            vm.assertGe(currentBlockConsumption, 133000);
            vm.assertLe(currentBlockConsumption, 350000);
        }
    }

    function test_checkGasLimitForFheEqWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheEq) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheEqWithBytes)
        );
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheEq(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 49000);
        vm.assertLe(currentBlockConsumption, 300000);
    }

    function test_checkGasLimitForFheEqBytesWorksAsExpectedForSupportedTypes(
        uint8 resultType,
        bytes1 scalarByte
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheEq) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheEqWithBytes)
        );
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheEqBytes(FheType(resultType), scalarByte, mockLHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 49000);
        vm.assertLe(currentBlockConsumption, 300000);
    }

    function test_checkGasLimitForFheNeWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheNe) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheNeWithBytes)
        );
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNe(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 49000);
        vm.assertLe(currentBlockConsumption, 300000);
    }

    function test_checkGasLimitForFheNeBytesWorksAsExpectedForSupportedTypes(
        uint8 resultType,
        bytes1 scalarByte
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheNe) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheNeWithBytes)
        );
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNeBytes(FheType(resultType), scalarByte, mockLHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 49000);
        vm.assertLe(currentBlockConsumption, 300000);
    }

    function test_checkGasLimitForFheGeWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheGe));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheGe(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 82000);
        vm.assertLe(currentBlockConsumption, 190000);
    }

    function test_checkGasLimitForFheGtWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheGt));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheGt(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 82000);
        vm.assertLe(currentBlockConsumption, 190000);
    }

    function test_checkGasLimitForFheLeWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheLe));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheLe(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 82000);
        vm.assertLe(currentBlockConsumption, 190000);
    }

    function test_checkGasLimitForFheLtWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheLt));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheLt(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 82000);
        vm.assertLe(currentBlockConsumption, 190000);
    }

    function test_checkGasLimitForFheMinWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheMin));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheMin(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 128000);
            vm.assertLe(currentBlockConsumption, 225000);
        } else {
            vm.assertGe(currentBlockConsumption, 128000);
            vm.assertLe(currentBlockConsumption, 241000);
        }
    }

    function test_checkGasLimitForFheMaxWorksAsExpectedForSupportedTypes(uint8 resultType, bytes1 scalarByte) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheMax));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheMax(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();

        if (scalarByte == 0x01) {
            vm.assertGe(currentBlockConsumption, 128000);
            vm.assertLe(currentBlockConsumption, 225000);
        } else {
            vm.assertGe(currentBlockConsumption, 128000);
            vm.assertLe(currentBlockConsumption, 241000);
        }
    }

    function test_checkGasLimitForFheNegWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheNeg));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNeg(FheType(resultType), mockLHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 95000);
        vm.assertLe(currentBlockConsumption, 309000);
    }

    function test_checkGasLimitForFheNotWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheNot));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNot(FheType(resultType), mockLHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 30000);
        vm.assertLe(currentBlockConsumption, 39000);
    }

    function test_checkGasLimitForCastWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesInputCast));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForCast(FheType(resultType), mockLHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertEq(currentBlockConsumption, 200);
    }

    function test_CheckGasLimitForTrivialEncryptWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesTrivialEncrypt) ||
                _isTypeSupported(FheType(resultType), supportedTypesTrivialEncryptWithBytes)
        );
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForTrivialEncrypt(FheType(resultType), mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 100);
        vm.assertLe(currentBlockConsumption, 6400);
    }

    function test_CheckGasLimitForIfThenElseWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheIfThenElse));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForIfThenElse(FheType(resultType), mockLHS, mockMiddle, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 43000);
        vm.assertLe(currentBlockConsumption, 300000);
    }

    function test_checkGasLimitForFheRandWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRand));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRand(FheType(resultType), mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertGe(currentBlockConsumption, 100000);
        vm.assertLe(currentBlockConsumption, 400000);
    }

    function test_checkGasLimitForFheRandBoundedWorksAsExpectedForSupportedTypes(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRandBounded));
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRandBounded(FheType(resultType), mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertEq(currentBlockConsumption, 100000);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheAdd(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheAdd(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheSub(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheSub(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheMul(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheMul(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheDiv(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheDiv(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheRem(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheRem(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheBitAnd(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheBitAnd(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheBitOr(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheBitOr(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheBitXor(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheBitXor(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheShl(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheShl(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheShr(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheShr(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheRotl(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheRotl(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheRotr(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheRotr(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheEq(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheEq(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheEqBytes(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheEqBytes(FheType.Uint8, 0x01, mockLHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheNe(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheNe(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheNeBytes(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheNeBytes(FheType.Uint8, 0x01, mockLHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheGe(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheGe(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheGt(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheGt(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheLe(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheLe(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheLt(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheLt(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheMin(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheMin(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheMax(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheMax(FheType.Uint8, 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheNeg(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheNeg(FheType.Uint8, mockLHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheNot(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheNot(FheType.Uint8, mockLHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForCast(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForCast(FheType.Uint8, mockLHS, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallCheckGasLimitForTrivialEncrypt(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForTrivialEncrypt(FheType.Uint8, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallCheckGasLimitForIfThenElse(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForIfThenElse(FheType.Uint8, mockLHS, mockMiddle, mockRHS, mockResult);
    }
    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheRand(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheRand(FheType.Uint8, mockResult);
    }

    function test_OnlyFHEVMExecutorCanCallcheckGasLimitForFheRandBounded(address randomAccount) public {
        vm.assume(randomAccount != fhevmExecutor);
        vm.prank(randomAccount);
        vm.expectRevert(FHEGasLimit.CallerMustBeFHEVMExecutorContract.selector);
        fheGasLimit.checkGasLimitForFheRandBounded(FheType.Uint8, mockResult);
    }

    function test_checkGasLimitForFheAddRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheAdd));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheAdd(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheSubRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheSub));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheSub(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheMulRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheMul));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheMul(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheDivRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheDiv));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheDiv(FheType(fheType), 0x01, mockLHS, mockRHS, mockResult);
    }
    function test_checkGasLimitForFheRemRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheRem));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRem(FheType(fheType), 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheBitAndRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheBitAnd));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheBitAnd(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheBitOrRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheBitOr));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheBitOr(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheBitXorRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheBitXor));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheBitXor(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheShlRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheShl));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheShl(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheShrRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheShr));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheShr(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheRotlRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheRotl));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRotl(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheRotrRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheRotr));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRotr(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheEqRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheEq));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheEq(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheEqBytesRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheEq));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheEqBytes(FheType(fheType), scalarByte, mockLHS, mockResult);
    }

    function test_checkGasLimitForFheNeRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheNe));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNe(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheNeBytesRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheNe));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNeBytes(FheType(fheType), scalarByte, mockLHS, mockResult);
    }

    function test_checkGasLimitForFheGeRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheGe));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheGe(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheGtRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheGt));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheGt(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheLeRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheLe));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheLe(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheLtRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheLt));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheLt(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheMinRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheMin));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheMin(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheMaxRevertsForUnsupportedTypes(uint8 fheType, bytes1 scalarByte) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheMax));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheMax(FheType(fheType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheNegRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheNeg));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNeg(FheType(fheType), mockLHS, mockResult);
    }

    function test_checkGasLimitForFheNotRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheNot));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheNot(FheType(fheType), mockLHS, mockResult);
    }

    function test_checkGasLimitForCastRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesInputCast));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForCast(FheType(fheType), mockLHS, mockResult);
    }

    function test_CheckGasLimitForTrivialEncryptRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(
            !_isTypeSupported(FheType(fheType), supportedTypesTrivialEncrypt) &&
                !_isTypeSupported(FheType(fheType), supportedTypesTrivialEncryptWithBytes)
        );
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForTrivialEncrypt(FheType(fheType), mockResult);
    }

    function test_CheckGasLimitForIfThenElseRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheIfThenElse));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForIfThenElse(FheType(fheType), mockLHS, mockMiddle, mockRHS, mockResult);
    }
    function test_checkGasLimitForFheRandRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheRand));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRand(FheType(fheType), mockResult);
    }

    function test_checkGasLimitForFheRandBoundedRevertsForUnsupportedTypes(uint8 fheType) public {
        vm.assume(fheType <= uint8(FheType.Int248));
        vm.assume(!_isTypeSupported(FheType(fheType), supportedTypesFheRandBounded));
        vm.expectRevert(FHEGasLimit.UnsupportedOperation.selector);
        vm.prank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheRandBounded(FheType(fheType), mockResult);
    }

    function test_checkGasLimitForFheDivRevertsIfNotScalar(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheDiv));
        bytes1 scalarByte = 0x00;
        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.OnlyScalarOperationsAreSupported.selector);
        fheGasLimit.checkGasLimitForFheDiv(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheRemRevertsIfNotScalar(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRem));
        bytes1 scalarByte = 0x00;
        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.OnlyScalarOperationsAreSupported.selector);
        fheGasLimit.checkGasLimitForFheRem(FheType(resultType), scalarByte, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheAddRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheAdd));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheAdd(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheSubRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheSub));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheSub(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheMulRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheMul));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheMul(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheDivRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheDiv));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheDiv(FheType(resultType), 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheRemRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRem));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheRem(FheType(resultType), 0x01, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheBitAndRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheBitAnd));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheBitAnd(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheBitOrRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheBitOr));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheBitOr(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheBitXorRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheBitXor));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheBitXor(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheShlRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheShl));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheShl(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheShrRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheShr));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheShr(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheRotlRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRotl));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheRotl(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheRotrRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRotr));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheRotr(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheEqRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheEq) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheEqWithBytes)
        );

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheEq(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheEqBytesRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheEq) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheEqWithBytes)
        );

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheEqBytes(FheType(resultType), scalarType, mockLHS, mockResult);
    }

    function test_checkGasLimitForFheNeRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheNe) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheNeWithBytes)
        );

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheNe(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheNeBytesRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesFheNe) ||
                _isTypeSupported(FheType(resultType), supportedTypesFheNeWithBytes)
        );

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheNeBytes(FheType(resultType), scalarType, mockLHS, mockResult);
    }

    function test_checkGasLimitForFheGeRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheGe));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheGe(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheGtRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheGt));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheGt(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheLeRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheLe));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheLe(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheLtRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheLt));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheLt(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheMinRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheMin));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheMin(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheMaxRevertsIfFheGasBlockLimitIsAboveBlockLimit(
        uint8 resultType,
        bytes1 scalarType
    ) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheMax));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheMax(FheType(resultType), scalarType, mockLHS, mockRHS, mockResult);
    }

    function test_checkGasLimitForFheNegRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheNeg));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheNeg(FheType(resultType), mockLHS, mockResult);
    }

    function test_checkGasLimitForFheNotRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheNot));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheNot(FheType(resultType), mockLHS, mockResult);
    }

    function test_checkGasLimitForCastRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesInputCast));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForCast(FheType(resultType), mockLHS, mockResult);
    }

    function test_CheckGasLimitForTrivialEncryptRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(
            _isTypeSupported(FheType(resultType), supportedTypesTrivialEncrypt) ||
                _isTypeSupported(FheType(resultType), supportedTypesTrivialEncryptWithBytes)
        );

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForTrivialEncrypt(FheType(resultType), mockResult);
    }

    function test_CheckGasLimitForIfThenElseRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheIfThenElse));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForIfThenElse(FheType(resultType), mockLHS, mockMiddle, mockRHS, mockResult);
    }
    function test_checkGasLimitForFheRandRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRand));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheRand(FheType(resultType), mockResult);
    }

    function test_checkGasLimitForFheRandBoundedRevertsIfFheGasBlockLimitIsAboveBlockLimit(uint8 resultType) public {
        vm.assume(resultType <= uint8(FheType.Int248));
        vm.assume(_isTypeSupported(FheType(resultType), supportedTypesFheRandBounded));

        fheGasLimit.updateFunding(FHE_GAS_BLOCKLIMIT);

        vm.prank(fhevmExecutor);
        vm.expectRevert(FHEGasLimit.FHEGasBlockLimitExceeded.selector);
        fheGasLimit.checkGasLimitForFheRandBounded(FheType(resultType), mockResult);
    }

    function test_CurrentBlockConsumptionRestartsWhenNewBlock() public {
        vm.startPrank(fhevmExecutor);
        fheGasLimit.checkGasLimitForFheAdd(FheType.Uint16, 0x01, mockLHS, mockRHS, mockResult);
        uint256 currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertEq(currentBlockConsumption, 133000);

        /// @dev In the same block, it should be 2x.
        fheGasLimit.checkGasLimitForFheAdd(FheType.Uint16, 0x01, mockLHS, mockRHS, mockResult);
        currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertEq(currentBlockConsumption, 133000 * 2);

        // It should reset, so it should be 1x.
        vm.roll(block.number + 1);
        fheGasLimit.checkGasLimitForFheAdd(FheType.Uint16, 0x01, mockLHS, mockRHS, mockResult);
        currentBlockConsumption = fheGasLimit.getCurrentBlockConsumption();
        vm.assertEq(currentBlockConsumption, 133000);

        vm.stopPrank();
    }

    /**
     * @dev Tests that only the owner can authorize an upgrade.
     */
    function test_OnlyOwnerCanAuthorizeUpgrade(address randomAccount) public {
        vm.assume(randomAccount != owner);
        /// @dev Have to use external call to this to avoid this issue:
        ///      https://github.com/foundry-rs/foundry/issues/5806
        vm.expectPartialRevert(OwnableUpgradeable.OwnableUnauthorizedAccount.selector);
        this.upgrade(randomAccount);
    }

    /**
     * @dev This function is used to test that only the owner can authorize an upgrade.
     *      It attempts to upgrade the proxy contract to a new implementation using a random account.
     *      The upgrade should fail if the random account is not the owner.
     */
    function upgrade(address randomAccount) external {
        UnsafeUpgrades.upgradeProxy(proxy, address(new EmptyUUPSProxy()), "", randomAccount);
    }

    /**
     * @dev Tests that only the owner can authorize an upgrade.
     */
    function test_OnlyOwnerCanAuthorizeUpgrade() public {
        /// @dev It does not revert since it called by the owner.
        UnsafeUpgrades.upgradeProxy(proxy, address(new EmptyUUPSProxy()), "", owner);
    }
}

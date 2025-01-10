// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UnsafeUpgrades} from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {KMSVerifier} from "../../contracts/KMSVerifier.sol";
import {EmptyUUPSProxy} from "../../contracts/emptyProxy/EmptyUUPSProxy.sol";
import {tfheExecutorAdd} from "../../addresses/TFHEExecutorAddress.sol";

contract KMSVerifierTest is Test {
    KMSVerifier internal kmsVerifier;

    address internal constant owner = address(456);

    address internal proxy;
    address internal implementation;

    function setUp() public {
        /// @dev It uses UnsafeUpgrades for measuring code coverage.
        proxy = UnsafeUpgrades.deployUUPSProxy(
            address(new EmptyUUPSProxy()),
            abi.encodeCall(EmptyUUPSProxy.initialize, owner)
        );

        implementation = address(new KMSVerifier());
        UnsafeUpgrades.upgradeProxy(proxy, implementation, "", owner);
        kmsVerifier = KMSVerifier(proxy);

        assertEq(kmsVerifier.owner(), owner);
    }

    function test_getVersion() public view {
        assertEq(kmsVerifier.getVersion(), string(abi.encodePacked("KMSVerifier v0.1.0")));
    }

    function test_postDeployment() public view {
        assertEq(kmsVerifier.getThreshold(), 0);
        assertEq(kmsVerifier.getSigners().length, 0);
    }

    function test_OnlyOwnerCanAddSigner(address randomAccount) public {
        vm.assume(randomAccount != owner);
        address randomSigner = address(42);
        vm.expectPartialRevert(OwnableUpgradeable.OwnableUnauthorizedAccount.selector);
        vm.prank(randomAccount);
        kmsVerifier.addSigner(randomSigner);
    }

    function test_OnlyOwnerCanRemoveSigner(address randomAccount) public {
        vm.assume(randomAccount != owner);
        address randomSigner = address(42);
        vm.expectPartialRevert(OwnableUpgradeable.OwnableUnauthorizedAccount.selector);
        vm.prank(randomAccount);
        kmsVerifier.removeSigner(randomSigner);
    }

    function test_OwnerCannotAddNullAddressAsSigner() public {
        address nullSigner = address(0);
        vm.expectPartialRevert(KMSVerifier.KMSSignerNull.selector);
        vm.prank(owner);
        kmsVerifier.addSigner(nullSigner);
    }

    function test_OwnerCanAddNewSigner() public {
        address randomSigner = address(42);
        vm.prank(owner);
        vm.expectEmit();
        emit KMSVerifier.SignerAdded(randomSigner);
        kmsVerifier.addSigner(randomSigner);
        assertEq(kmsVerifier.getSigners()[0], randomSigner);
        assertTrue(kmsVerifier.isSigner(randomSigner));
    }

    function test_OwnerCannotAddSameSignerTwice() public {
        /// @dev We call the other test to avoid repeating the same code.
        test_OwnerCanAddNewSigner();
        address randomSigner = kmsVerifier.getSigners()[0];
        vm.prank(owner);
        vm.expectRevert(KMSVerifier.KMSAlreadySigner.selector);
        kmsVerifier.addSigner(randomSigner);
    }

    function test_OwnerCannotRemoveSignerIfNotSigner() public {
        address randomSigner = address(42);
        vm.prank(owner);
        vm.expectRevert(KMSVerifier.KMSNotASigner.selector);
        kmsVerifier.removeSigner(randomSigner);
    }

    function test_OwnerCanRemoveSigner() public {
        /// @dev We call the other test to avoid repeating the same code.
        test_OwnerCanAddNewSigner();

        address randomSigner2 = address(43);
        vm.prank(owner);
        kmsVerifier.addSigner(randomSigner2);
        assertEq(kmsVerifier.getSigners().length, 2);

        address randomSigner1 = kmsVerifier.getSigners()[0];
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit KMSVerifier.SignerRemoved(randomSigner1);
        kmsVerifier.removeSigner(randomSigner1);

        assertFalse(kmsVerifier.isSigner(randomSigner1));
        assertEq(kmsVerifier.getSigners().length, 1);
    }

    function test_OwnerCannotRemoveTheLastSigner() public {
        /// @dev We call the other test to avoid repeating the same code.
        test_OwnerCanAddNewSigner();

        address randomSigner = kmsVerifier.getSigners()[0];
        vm.prank(owner);
        vm.expectRevert(KMSVerifier.AtLeastOneSignerIsRequired.selector);
        kmsVerifier.removeSigner(randomSigner);
    }

    function upgrade(address randomAccount) external {
        UnsafeUpgrades.upgradeProxy(proxy, address(new EmptyUUPSProxy()), "", randomAccount);
    }

    function test_OnlyOwnerCanAuthorizeUpgrade(address randomAccount) public {
        vm.assume(randomAccount != owner);
        /// @dev Have to use external call to this to avoid this issue:
        ///      https://github.com/foundry-rs/foundry/issues/5806
        vm.expectPartialRevert(OwnableUpgradeable.OwnableUnauthorizedAccount.selector);
        this.upgrade(randomAccount);
    }

    function test_OnlyOwnerCanAuthorizeUpgrade() public {
        /// @dev It does not revert since it called by the owner.
        UnsafeUpgrades.upgradeProxy(proxy, address(new EmptyUUPSProxy()), "", owner);
    }
}

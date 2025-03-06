// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UnsafeUpgrades} from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {KMSVerifier} from "../../contracts/KMSVerifier.sol";
import {EmptyUUPSProxy} from "../../contracts/emptyProxy/EmptyUUPSProxy.sol";
import {tfheExecutorAdd} from "../../addresses/TFHEExecutorAddress.sol";

contract KMSVerifierTest is Test {
    KMSVerifier internal kmsVerifier;

    address internal constant owner = address(456);

    address internal proxy;
    address internal implementation;

    uint256 internal privateKeySigner1 = 0x022;
    uint256 internal privateKeySigner2 = 0x03;
    uint256 internal privateKeySigner3 = 0x04;

    address internal kmsSigner1;
    address internal kmsSigner2;
    address internal kmsSigner3;

    function _computeSignature(uint256 privateKey, bytes32 digest) internal pure returns (bytes memory signature) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function _computeDigest(
        bytes32[] memory handlesList,
        bytes memory decryptedResult
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                kmsVerifier.DECRYPTION_RESULT_TYPEHASH(),
                keccak256(abi.encodePacked(handlesList)),
                keccak256(decryptedResult)
            )
        );

        bytes32 hashTypeData = MessageHashUtils.toTypedDataHash(_computeDomainSeparator(), structHash);
        return hashTypeData;
    }

    function _computeDomainSeparator() internal view returns (bytes32) {
        (, string memory name, string memory version, uint256 chainId, address verifyingContract, , ) = kmsVerifier
            .eip712Domain();

        return
            keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                    keccak256(bytes(name)),
                    keccak256(bytes(version)),
                    chainId,
                    verifyingContract
                )
            );
    }

    function _setSigners() internal {
        vm.startPrank(owner);
        kmsVerifier.addSigner(kmsSigner1);
        kmsVerifier.addSigner(kmsSigner2);
        kmsVerifier.addSigner(kmsSigner3);
        vm.stopPrank();
    }

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

        kmsSigner1 = vm.addr(privateKeySigner1);
        kmsSigner2 = vm.addr(privateKeySigner2);
        kmsSigner3 = vm.addr(privateKeySigner3);
    }

    function test_getVersion() public view {
        assertEq(kmsVerifier.getVersion(), string(abi.encodePacked("KMSVerifier v0.1.0")));
    }

    function test_postDeployment() public view {
        assertEq(kmsVerifier.getThreshold(), 0);
        assertEq(kmsVerifier.getSigners().length, 0);
    }

    function test_getThresholdWorksAsExpected() public {
        vm.startPrank(owner);

        // (1 - 1) / 3 + 1 = 1
        kmsVerifier.addSigner(address(1));
        assertEq(kmsVerifier.getThreshold(), 1);

        // (2-1) / 3 + 1 = 1/3 + 1 --> 0 + 1 = 1 (1/3 = 0 in Solidity since it rounds down)
        kmsVerifier.addSigner(address(2));
        assertEq(kmsVerifier.getThreshold(), 1);

        // (3-1) / 3 + 1 = 2/3 + 1 --> 0 + 1 = 1 (2/3 = 0 in Solidity since it rounds down)
        kmsVerifier.addSigner(address(3));
        assertEq(kmsVerifier.getThreshold(), 1);

        // (4-1) / 3 + 1 = 3/3 + 1 = 2.
        kmsVerifier.addSigner(address(4));
        assertEq(kmsVerifier.getThreshold(), 2);

        // (5-1) / 3 + 1 = 4/3 + 1 --> 1 + 1 = 2 (4/3 = 1 in Solidity since it rounds down)
        kmsVerifier.addSigner(address(5));
        assertEq(kmsVerifier.getThreshold(), 2);

        // (6-1) / 3 + 1 = 5/3 + 1 --> 1 + 1 = 2 (5/3 = 1 in Solidity since it rounds down)
        kmsVerifier.addSigner(address(6));
        assertEq(kmsVerifier.getThreshold(), 2);

        // (7 - 1) / 3 + 1 = 3
        kmsVerifier.addSigner(address(7));
        assertEq(kmsVerifier.getThreshold(), 3);

        vm.stopPrank();
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

    function test_verifyInputEIP712KMSSignaturesWork() public {
        _setSigners();
        address emptyAddress = address(42);
        bytes32[] memory handlesList = new bytes32[](3);
        handlesList[0] = bytes32(uint256(4));
        handlesList[1] = bytes32(uint256(5));
        handlesList[2] = bytes32(uint256(323));

        bytes memory decryptedResult = abi.encodePacked(keccak256("test"), keccak256("test"), keccak256("test"));
        bytes[] memory signatures = new bytes[](3);

        bytes32 digest = _computeDigest(handlesList, decryptedResult);

        signatures[0] = _computeSignature(privateKeySigner1, digest);
        signatures[1] = _computeSignature(privateKeySigner2, digest);
        signatures[2] = _computeSignature(privateKeySigner3, digest);

        assertTrue(
            kmsVerifier.verifyDecryptionEIP712KMSSignatures(emptyAddress, handlesList, decryptedResult, signatures)
        );
    }

    function test_verifyInputEIP712KMSSignaturesFailAsExpectedIfDigestIsInvalid() public {
        _setSigners();
        address emptyAddress = address(42);
        bytes32[] memory handlesList = new bytes32[](3);
        handlesList[0] = bytes32(uint256(4));
        handlesList[1] = bytes32(uint256(5));
        handlesList[2] = bytes32(uint256(323));

        bytes memory decryptedResult = abi.encodePacked(keccak256("test"), keccak256("test"), keccak256("test"));
        bytes[] memory signatures = new bytes[](3);

        bytes32 invalidDigest = bytes32("420");

        signatures[0] = _computeSignature(privateKeySigner1, invalidDigest);
        signatures[1] = _computeSignature(privateKeySigner2, invalidDigest);
        signatures[2] = _computeSignature(privateKeySigner3, invalidDigest);

        vm.expectPartialRevert(KMSVerifier.KMSInvalidSigner.selector);
        kmsVerifier.verifyDecryptionEIP712KMSSignatures(emptyAddress, handlesList, decryptedResult, signatures);
    }

    function test_verifyInputEIP712KMSSignaturesFailAsExpectedIfNoSignerAdded() public {
        address emptyAddress = address(42);
        bytes32[] memory handlesList = new bytes32[](3);
        handlesList[0] = bytes32(uint256(4));
        handlesList[1] = bytes32(uint256(5));
        handlesList[2] = bytes32(uint256(323));

        bytes memory decryptedResult = abi.encodePacked(keccak256("test"), keccak256("test"), keccak256("test"));
        bytes[] memory signatures = new bytes[](3);

        bytes32 digest = _computeDigest(handlesList, decryptedResult);

        signatures[0] = _computeSignature(privateKeySigner1, digest);
        signatures[1] = _computeSignature(privateKeySigner2, digest);
        signatures[2] = _computeSignature(privateKeySigner3, digest);

        vm.expectPartialRevert(KMSVerifier.KMSInvalidSigner.selector);
        kmsVerifier.verifyDecryptionEIP712KMSSignatures(emptyAddress, handlesList, decryptedResult, signatures);
    }

    function test_verifyInputEIP712KMSSignaturesFailAsExpectedIfNoSignatureProvided() public {
        _setSigners();

        address emptyAddress = address(42);
        bytes32[] memory handlesList = new bytes32[](3);
        handlesList[0] = bytes32(uint256(4));
        handlesList[1] = bytes32(uint256(5));
        handlesList[2] = bytes32(uint256(323));

        bytes memory decryptedResult = abi.encodePacked(keccak256("test"), keccak256("test"), keccak256("test"));
        bytes[] memory signatures = new bytes[](0);

        bytes32 digest = _computeDigest(handlesList, decryptedResult);

        vm.expectPartialRevert(KMSVerifier.KMSZeroSignature.selector);
        kmsVerifier.verifyDecryptionEIP712KMSSignatures(emptyAddress, handlesList, decryptedResult, signatures);
    }

    function test_verifyInputEIP712KMSSignaturesFailAsExpectedIfNumberOfSignaturesIsInferiorToThreshold() public {
        address randomNewSigner = address(100);
        _setSigners();
        vm.prank(owner);
        kmsVerifier.addSigner(randomNewSigner);
        address emptyAddress = address(42);
        bytes32[] memory handlesList = new bytes32[](3);
        handlesList[0] = bytes32(uint256(4));
        handlesList[1] = bytes32(uint256(5));
        handlesList[2] = bytes32(uint256(323));

        bytes memory decryptedResult = abi.encodePacked(keccak256("test"), keccak256("test"), keccak256("test"));
        bytes[] memory signatures = new bytes[](1);
        bytes32 digest = _computeDigest(handlesList, decryptedResult);
        signatures[0] = _computeSignature(privateKeySigner1, digest);

        assertEq(kmsVerifier.getThreshold(), 2);

        vm.expectPartialRevert(KMSVerifier.KMSSignatureThresholdNotReached.selector);
        kmsVerifier.verifyDecryptionEIP712KMSSignatures(emptyAddress, handlesList, decryptedResult, signatures);
    }
}

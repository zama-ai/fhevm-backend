// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UnsafeUpgrades} from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {InputVerifier} from "../../contracts/InputVerifier.sol";
import {EmptyUUPSProxy} from "../../contracts/emptyProxy/EmptyUUPSProxy.sol";

contract InputVerifierTest is Test {
    InputVerifier internal inputVerifier;

    address internal constant owner = address(456);
    uint256 internal constant privateKeySigner0 = 0x022;
    uint256 internal constant privateKeySigner1 = 0x03;
    uint256 internal constant privateKeySigner2 = 0x04;

    address internal constant verifyingContractSource = address(123);
    address internal signer0 = address(50);
    address internal signer1 = address(51);
    address internal signer2 = address(52);

    address internal proxy;
    address internal implementation;

    /**
     * @dev Computes the signature for a given digest using the provided private key.
     * @param privateKey The private key used to sign the digest.
     * @param digest The hash of the data to be signed.
     * @return signature The computed signature as a byte array, encoded as {r}{s}{v}.
     */
    function _computeSignature(uint256 privateKey, bytes32 digest) internal pure returns (bytes memory signature) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        return abi.encodePacked(r, s, v);
    }

    /**
     * @dev Computes the digest of the given handles list and decrypted result.
     * This function uses the EIP-712 encoding scheme to hash the data.
     *
     * @param handlesList An array of bytes32 representing the handles.
     * @param decryptedResult A bytes array containing the decrypted result.
     * @return A bytes32 hash representing the computed digest.
     */
    function _computeDigest(
        bytes32[] memory handlesList,
        bytes memory decryptedResult
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                inputVerifier.EIP712_ZKPOK_TYPEHASH(),
                keccak256(abi.encodePacked(handlesList)),
                keccak256(decryptedResult)
            )
        );

        bytes32 hashTypeData = MessageHashUtils.toTypedDataHash(_computeDomainSeparator(), structHash);
        return hashTypeData;
    }

    /**
     * @dev Computes the EIP-712 domain separator.
     * This function retrieves the domain parameters from the `kmsVerifier` contract,
     * including the name, version, chain ID, and verifying contract address.
     * It then encodes these parameters and hashes them using the keccak256 algorithm
     * to produce the domain separator.
     *
     * @return bytes32 The computed domain separator.
     */
    function _computeDomainSeparator() internal view returns (bytes32) {
        (, string memory name, string memory version, uint256 chainId, address verifyingContract, , ) = inputVerifier
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

    /**
     * @dev Internal function to deploy a UUPS proxy contract.
     * The proxy is deployed using the UnsafeUpgrades library and initialized with the owner address.
     */
    function _deployProxy() internal {
        proxy = UnsafeUpgrades.deployUUPSProxy(
            address(new EmptyUUPSProxy()),
            abi.encodeCall(EmptyUUPSProxy.initialize, owner)
        );
    }

    function _upgradeProxy(address[] memory signers) internal {
        implementation = address(new InputVerifier());
        UnsafeUpgrades.upgradeProxy(
            proxy,
            implementation,
            abi.encodeCall(InputVerifier.reinitialize, (verifyingContractSource, uint64(block.chainid), signers)),
            owner
        );
        inputVerifier = InputVerifier(proxy);
    }

    function _initializeSigners() internal {
        signer0 = vm.addr(privateKeySigner0);
        signer1 = vm.addr(privateKeySigner1);
        signer2 = vm.addr(privateKeySigner2);
    }

    function setUp() public {
        _deployProxy();
        _initializeSigners();
        address[] memory signers = new address[](3);
        signers[0] = signer0;
        signers[1] = signer1;
        signers[2] = signer2;
        _upgradeProxy(signers);

        assertEq(inputVerifier.owner(), owner);
    }

    function test_getVersion() public view {
        assertEq(inputVerifier.getVersion(), string(abi.encodePacked("InputVerifier v0.1.0")));
    }

    function test_getCoprocessorSigners() public view {
        address[] memory signers = inputVerifier.getCoprocessorSigners();
        assertEq(signers.length, 3);
        assertEq(signers[0], signer0);
        assertEq(signers[1], signer1);
        assertEq(signers[2], signer2);
        assertTrue(inputVerifier.isSigner(signers[0]));
        assertTrue(inputVerifier.isSigner(signer1));
        assertTrue(inputVerifier.isSigner(signer2));
    }

    function test_getThreshold() public view {
        /// @dev The threshold is 2 since we have 3 signers.
        uint256 threshold = inputVerifier.getThreshold();
        assertEq(threshold, 2);
    }

    /**
     * @dev Tests that the contract owner cannot add a null address as a signer.
     */
    function test_OwnerCannotAddNullAddressAsSigner() public {
        vm.expectPartialRevert(InputVerifier.SignerNull.selector);
        vm.prank(owner);
        inputVerifier.addSigner(address(0));
    }

    function test_OnlyOwnerCanAuthorizeUpgrade(address randomAccount) public {
        vm.assume(randomAccount != owner);
        /// @dev Have to use external call to this to avoid this issue:
        ///      https://github.com/foundry-rs/foundry/issues/5806
        vm.expectPartialRevert(OwnableUpgradeable.OwnableUnauthorizedAccount.selector);
        this.upgrade(randomAccount);
    }

    function upgrade(address randomAccount) external {
        UnsafeUpgrades.upgradeProxy(proxy, address(new EmptyUUPSProxy()), "", randomAccount);
    }

    function test_OnlyOwnerCanAuthorizeUpgrade() public {
        /// @dev It does not revert since it called by the owner.
        UnsafeUpgrades.upgradeProxy(proxy, address(new EmptyUUPSProxy()), "", owner);
    }
}

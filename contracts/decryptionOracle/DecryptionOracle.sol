// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DecryptionOracle is UUPSUpgradeable, Ownable2StepUpgradeable {
    /// @notice Name of the contract
    string private constant CONTRACT_NAME = "DecryptionOracle";

    /// @notice Major version of the contract.
    uint256 private constant MAJOR_VERSION = 0;

    /// @notice Minor version of the contract.
    uint256 private constant MINOR_VERSION = 1;

    /// @notice Patch version of the contract.
    uint256 private constant PATCH_VERSION = 0;

    event DecryptionRequest(uint256 indexed requestID, uint256[] cts, address contractCaller, bytes4 callbackSelector);

    function _authorizeUpgrade(address _newImplementation) internal virtual override onlyOwner {}

    /// @custom:storage-location erc7201:fhevm.storage.DecryptionOracle
    struct DecryptionOracleStorage {
        uint256 counter; // tracks the number of decryption requests, and used to compute the requestID by hashing it with the dApp address
    }

    function getCounter() external virtual returns (uint256) {
        DecryptionOracleStorage storage $ = _getDecryptionOracleStorage();
        return $.counter;
    }

    // keccak256(abi.encode(uint256(keccak256("fhevm.storage.DecryptionOracle")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant DecryptionOracleStorageLocation =
        0xd86fa2a52e99634194c279afa011b5f5166614c3198dd09bbd002d5fb5c0bc00;

    /**
     * @dev Returns the DecryptionOracle storage location.
     */
    function _getDecryptionOracleStorage() internal pure returns (DecryptionOracleStorage storage $) {
        assembly {
            $.slot := DecryptionOracleStorageLocation
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _decryptionOracleOwner) external initializer {
        __Ownable_init(_decryptionOracleOwner);
    }

    /** @notice Requests the decryption of n ciphertexts `ctsHandles` with the result returned in a callback.
     * @notice During callback, msg.sender is called with [callbackSelector,requestID,decrypt(ctsHandles[0]),decrypt(ctsHandles[1]),...,decrypt(ctsHandles[n-1]),signatures]
     * @param ctsHandles is an array of uint256s handles.
     * @param callbackSelector the callback selector to be called on msg.sender later during fulfilment
     */
    function requestDecryption(
        uint256[] calldata ctsHandles,
        bytes4 callbackSelector
    ) external virtual returns (uint256 requestID) {
        DecryptionOracleStorage storage $ = _getDecryptionOracleStorage();
        requestID = uint256(keccak256(abi.encodePacked(msg.sender, $.counter)));
        emit DecryptionRequest(requestID, ctsHandles, msg.sender, callbackSelector);
        $.counter++;
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
}
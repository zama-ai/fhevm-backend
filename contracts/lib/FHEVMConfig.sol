// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "../addresses/ACLAddress.sol";
import "../addresses/KMSVerifierAddress.sol";
import "../addresses/InputVerifierAddress.sol";
import "../addresses/TFHEExecutorAddress.sol";

library FHEVMConfig {
    struct FHEVMConfigStruct {
        address ACLAddress;
        address TFHEExecutorAddress;
        address KMSVerifierAddress;
        address InputVerifierAddress;
    }

    /// @dev Function to return an immutable struct
    function defaultConfig() internal pure returns (FHEVMConfigStruct memory) {
        return
            FHEVMConfigStruct({
                ACLAddress: aclAdd,
                TFHEExecutorAddress: tfheExecutorAdd,
                KMSVerifierAddress: kmsVerifierAdd,
                InputVerifierAddress: inputVerifierAdd
            });
    }
}

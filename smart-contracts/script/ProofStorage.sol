// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ProofStorage} from "../src/ProofStorage.sol";

contract ProofStorageScript is Script {
    ProofStorage public proofStore;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        proofStore = new ProofStorage();

        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {stdError} from "forge-std/StdError.sol";
import "../src/ProofStorage.sol";

contract ProofStorageTest is Test {
    ProofStorage proofStorage;

    function setUp() public {
        proofStorage = new ProofStorage();
    }

    function test_UploadProof() public {
        proofStorage.uploadProof("QmTestHash123", "Test Invoice");
        
        ProofStorage.Proof[] memory proofs = proofStorage.getMyProofs();
        assertEq(proofs.length, 1, "Proof should be added");
        assertEq(proofs[0].ipfsHash, "QmTestHash123", "IPFS hash should match");
        assertEq(proofs[0].description, "Test Invoice", "Description should match");
    }

     function test_UploadProof_RevertsIfIPFSHashEmpty() public {
        vm.expectRevert("IPFS hash cannot be empty");
        proofStorage.uploadProof("", "Valid Description");
    }

    function test_UploadProof_RevertsIfDescriptionEmpty() public {
        vm.expectRevert("Description cannot be empty");
        proofStorage.uploadProof("QmValidHash", "");
    }

    function test_ProofUploaded_EventEmitted() public {
        vm.expectEmit(true, true, false, true);
        emit ProofStorage.ProofUploaded(address(this), "QmTestHash456", "Event Test");

        proofStorage.uploadProof("QmTestHash456", "Event Test");
    }

    function test_GetUserProofs() public {
        proofStorage.uploadProof("QmTestHash456", "Test Receipt");

        ProofStorage.Proof[] memory userProofs = proofStorage.getUserProofs(address(this));
        assertEq(userProofs.length, 1, "User proofs should contain one proof");
        assertEq(userProofs[0].ipfsHash, "QmTestHash456", "IPFS hash should match");
    }
}

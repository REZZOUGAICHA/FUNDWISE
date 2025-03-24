// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {stdError} from "forge-std/StdError.sol";
import "../src/ProofStorage.sol";

contract ProofStorageTest is Test {
    ProofStorage proofStorage;
    address admin;
    address auditor;
    address user;

    event ProofUploaded(address indexed user, string ipfsHash, string description);
    event ProofAudited(address indexed auditor, address indexed user, uint256 proofIndex, bool flagged);

    function setUp() public {
        admin = address(this);
        auditor = address(0x1);
        user = address(0x2);
        proofStorage = new ProofStorage();
    }

    function test_AdminSetup() public view {
        assertEq(proofStorage.admin(), admin, "Admin should be deployer");
    }

    function test_AddAuditor() public {
        proofStorage.addAuditor(auditor);
        assertTrue(proofStorage.auditors(auditor), "Auditor should be added");
    }

    function test_UploadProof() public {
        proofStorage.uploadProof("QmTestHash123", "Test Invoice");
        ProofStorage.Proof[] memory proofs = proofStorage.getMyProofs();

        assertEq(proofs.length, 1, "Proof should be added");
        assertEq(proofs[0].ipfsHash, "QmTestHash123", "IPFS hash should match");
        assertEq(proofs[0].description, "Test Invoice", "Description should match");
        assertFalse(proofs[0].audited, "Proof should not be audited initially");
        assertFalse(proofs[0].flagged, "Proof should not be flagged initially");
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
        emit ProofUploaded(address(this), "QmTestHash456", "Event Test");
        proofStorage.uploadProof("QmTestHash456", "Event Test");
    }

    function test_AuditProof() public {
        proofStorage.addAuditor(auditor);
        proofStorage.uploadProof("QmAuditTest", "Auditable Proof");

        vm.prank(auditor);
        proofStorage.auditProof(address(this), 0, true);

        ProofStorage.Proof[] memory proofs = proofStorage.getMyProofs();
        assertTrue(proofs[0].audited, "Proof should be audited");
        assertTrue(proofs[0].flagged, "Proof should be flagged");
    }

    function test_AuditProof_RevertsIfNotAuditor() public {
        proofStorage.uploadProof("QmAuditTest", "Auditable Proof");

        vm.expectRevert("Only auditors can review proofs");
        proofStorage.auditProof(address(this), 0, true);
    }

    function test_AuditProof_RevertsIfInvalidIndex() public {
        proofStorage.addAuditor(auditor);
        
        vm.prank(auditor);
        vm.expectRevert("Invalid proof index");
        proofStorage.auditProof(address(this), 0, true);
    }

    function test_AuditProof_RevertsIfAlreadyAudited() public {
        proofStorage.addAuditor(auditor);
        proofStorage.uploadProof("QmAuditTest", "Auditable Proof");

        vm.prank(auditor);
        proofStorage.auditProof(address(this), 0, false);

        vm.prank(auditor);
        vm.expectRevert("Already audited");
        proofStorage.auditProof(address(this), 0, true);
    }

    function test_GetUserProofs() public {
        proofStorage.addAuditor(auditor);
        proofStorage.uploadProof("QmTestHash456", "Test Receipt");

        vm.prank(auditor);
        ProofStorage.Proof[] memory userProofs = proofStorage.getUserProofs(address(this));

        assertEq(userProofs.length, 1, "User proofs should contain one proof");
        assertEq(userProofs[0].ipfsHash, "QmTestHash456", "IPFS hash should match");
    }

    function test_GetUserProofs_RevertsIfNotAuthorized() public {
        proofStorage.uploadProof("QmUnauthorized", "Unauthorized Test");
        
        vm.prank(user);
        vm.expectRevert("Access denied");
        proofStorage.getUserProofs(address(this));
    }
}

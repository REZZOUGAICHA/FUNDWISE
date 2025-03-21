//Stores proofs of fund usage (invoice, receipts) using IPFS.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofStorage {
    struct Proof {
        string ipfsHash; 
        string description;
    }

    mapping(address => Proof[]) private proofs;
    event ProofUploaded(address indexed user, string ipfsHash, string description);

    // Upload a proof (invoice/receipt)
    function uploadProof(string memory _ipfsHash, string memory _description) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        proofs[msg.sender].push(Proof(_ipfsHash, _description));
        
        emit ProofUploaded(msg.sender, _ipfsHash, _description);
    }

    // Retrieve all proofs of a sender for the sender
    function getMyProofs() public view returns (Proof[] memory) {
        return proofs[msg.sender];
    }

    // Retrieve all proofs of a specific user
    // To add : access control
    function getUserProofs(address _user) public view returns (Proof[] memory) {
        return proofs[_user];
    }
}
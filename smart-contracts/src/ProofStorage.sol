//Stores proofs of fund usage (invoice, receipts) using IPFS.
pragma solidity ^0.8.20;

contract FundUsageProof {
    struct Proof {
        string ipfsHash; 
        string description;
    }

    mapping(address => Proof[]) private proofs;

    // Upload a proof (invoice/receipt)
    function uploadProof(string memory _ipfsHash, string memory _description) public {
        proofs[msg.sender].push(Proof(_ipfsHash, _description));
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
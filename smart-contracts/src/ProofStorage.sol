//Stores proofs of fund usage (invoice, receipts) using IPFS.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofStorage {
    address public admin;

    constructor() {
        admin = msg.sender; // Deployer is the admin
    }

    struct Proof {
        string ipfsHash; 
        string description;
        bool audited; 
        bool flagged; // Marked as suspicious
    }

    mapping(address => Proof[]) private proofs;
    mapping(address => bool) public auditors; // Authorized auditors

    event ProofUploaded(address indexed user, string ipfsHash, string description);
    event ProofAudited(address indexed auditor, address indexed user, uint256 proofIndex, bool flagged);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender], "Only auditors can review proofs");
        _;
    }

    // Admin adds auditors
    function addAuditor(address _auditor) public onlyAdmin {
        auditors[_auditor] = true;
    }


    // Upload a proof (invoice/receipt)
    function uploadProof(string memory _ipfsHash, string memory _description) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        proofs[msg.sender].push(Proof(_ipfsHash, _description, false, false));
        
        emit ProofUploaded(msg.sender, _ipfsHash, _description);
    }

    // Auditors can mark a proof as verified or flagged
    function auditProof(address _user, uint256 proofIndex, bool _flagged) public onlyAuditor {
        require(proofIndex < proofs[_user].length, "Invalid proof index");
        require(!proofs[_user][proofIndex].audited, "Already audited");

        proofs[_user][proofIndex].audited = true;
        proofs[_user][proofIndex].flagged = _flagged;

        emit ProofAudited(msg.sender, _user, proofIndex, _flagged);
    }

    // Retrieve all proofs of a sender for the sender
    function getMyProofs() public view returns (Proof[] memory) {
        return proofs[msg.sender];
    }

    // Retrieve all proofs of a specific user
    // To add : access control
    function getUserProofs(address _user) public view returns (Proof[] memory) {
        require(msg.sender == admin || auditors[msg.sender], "Access denied");
        return proofs[_user];
    }
}
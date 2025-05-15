// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProofStorage
 * @dev Stores proofs of fund usage (invoices, receipts) using IPFS
 * This contract is the foundation for the verification system
 */
contract ProofStorage is Ownable, ReentrancyGuard, Pausable {
    // Status constants for proof lifecycle
    uint8 public constant PROOF_STATUS_SUBMITTED = 1; // Proof has been submitted by NGO
    uint8 public constant PROOF_STATUS_APPROVED = 2;  // Proof has been approved by validator
    uint8 public constant PROOF_STATUS_REJECTED = 3;  // Proof has been rejected by validator
    uint8 public constant PROOF_STATUS_FUNDS_RELEASED = 4; // Funds have been released for this proof

    // Struct to store proof details
    struct Proof {
        bytes32 id;               // Unique proof identifier
        uint256 campaignId;       // Associated campaign ID
        string ipfsHash;          // IPFS hash of the proof documents
        string description;       // Description of how funds were/will be used
        uint256 amount;           // Amount of funds requested/used
        uint8 status;             // Current status of the proof
        address submitter;        // Address that submitted the proof
        uint256 timestamp;        // When the proof was submitted
    }

    // Mappings to track proofs
    mapping(bytes32 => Proof) private proofs;
    mapping(uint256 => bytes32[]) private campaignProofs; // All proofs for a campaign
    mapping(address => bool) public validators;           // Authorized validators

    // Events
    event ProofSubmitted(bytes32 indexed proofId, uint256 indexed campaignId, string ipfsHash, uint256 amount);
    event ProofStatusChanged(bytes32 indexed proofId, uint8 status);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    // Modifiers
    modifier onlyValidator() {
        require(validators[msg.sender] || owner() == msg.sender, "Not authorized as validator");
        _;
    }

    /**
     * @dev Constructor adds the contract deployer as the first validator
     */
    constructor() Ownable(msg.sender) {
        validators[msg.sender] = true;
        emit ValidatorAdded(msg.sender);
    }

    /**
     * @dev Add a new validator
     * @param _validator Address of the validator to add
     */
    function addValidator(address _validator) external onlyOwner {
        require(_validator != address(0), "Invalid validator address");
        require(!validators[_validator], "Already a validator");
        
        validators[_validator] = true;
        emit ValidatorAdded(_validator);
    }

    /**
     * @dev Remove a validator
     * @param _validator Address of the validator to remove
     */
    function removeValidator(address _validator) external onlyOwner {
        require(validators[_validator], "Not a validator");
        
        validators[_validator] = false;
        emit ValidatorRemoved(_validator);
    }

    /**
     * @dev Submit proof of fund usage
     * @param _campaignId ID of the associated campaign
     * @param _ipfsHash IPFS hash of the proof documents
     * @param _description Description of how funds were/will be used
     * @param _amount Amount of funds requested/used
     * @return The ID of the created proof
     *
     * NGOs call this to submit evidence for fund requests or usage reports
     */
    function submitProof(
        uint256 _campaignId, 
        string memory _ipfsHash, 
        string memory _description, 
        uint256 _amount
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_amount >= 0, "Amount must be non-negative");
        
        // Generate a unique proof ID using keccak256
        bytes32 proofId = keccak256(abi.encodePacked(_campaignId, _ipfsHash, block.timestamp, msg.sender));
        
        // Ensure proof ID doesn't already exist
        require(!proofExists(proofId), "Proof already exists");
        
        // Create and store the proof
        proofs[proofId] = Proof({
            id: proofId,
            campaignId: _campaignId,
            ipfsHash: _ipfsHash,
            description: _description,
            amount: _amount,
            status: PROOF_STATUS_SUBMITTED,
            submitter: msg.sender,
            timestamp: block.timestamp
        });
        
        // Add proof to campaign tracking
        campaignProofs[_campaignId].push(proofId);
        
        emit ProofSubmitted(proofId, _campaignId, _ipfsHash, _amount);
        return proofId;
    }

    /**
     * @dev Set the status of a proof
     * @param _proofId ID of the proof
     * @param _status New status code
     *
     * Only validators can change proof status
     */
    function setProofStatus(bytes32 _proofId, uint8 _status) external onlyValidator {
        require(proofExists(_proofId), "Proof does not exist");
        require(_status > 0 && _status <= 4, "Invalid status");
        
        proofs[_proofId].status = _status;
        emit ProofStatusChanged(_proofId, _status);
    }

    /**
     * @dev Check if a proof exists
     * @param _proofId ID of the proof
     * @return bool Whether the proof exists
     */
    function proofExists(bytes32 _proofId) public view returns (bool) {
        return proofs[_proofId].submitter != address(0);
    }

    /**
     * @dev Get details of a proof
     * @param _proofId ID of the proof
     * @return Proof struct containing all proof details
     */
    function getProof(bytes32 _proofId) external view returns (Proof memory) {
        require(proofExists(_proofId), "Proof does not exist");
        return proofs[_proofId];
    }

    /**
     * @dev Get the campaign ID associated with a proof
     * @param _proofId ID of the proof
     * @return uint256 Campaign ID
     */
    function getProofCampaign(bytes32 _proofId) external view returns (uint256) {
        require(proofExists(_proofId), "Proof does not exist");
        return proofs[_proofId].campaignId;
    }

    /**
     * @dev Get the amount of funds requested in a proof
     * @param _proofId ID of the proof
     * @return uint256 Amount requested
     */
    function getProofAmount(bytes32 _proofId) external view returns (uint256) {
        require(proofExists(_proofId), "Proof does not exist");
        return proofs[_proofId].amount;
    }

    /**
     * @dev Get the current status of a proof
     * @param _proofId ID of the proof
     * @return uint8 Status code
     */
    function getProofStatus(bytes32 _proofId) external view returns (uint8) {
        require(proofExists(_proofId), "Proof does not exist");
        return proofs[_proofId].status;
    }

    /**
     * @dev Get all proofs associated with a campaign
     * @param _campaignId ID of the campaign
     * @return bytes32[] Array of proof IDs
     */
    function getCampaignProofs(uint256 _campaignId) external view returns (bytes32[] memory) {
        return campaignProofs[_campaignId];
    }
    
    /**
     * @dev Pause the contract
     * Only owner can pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     * Only owner can unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
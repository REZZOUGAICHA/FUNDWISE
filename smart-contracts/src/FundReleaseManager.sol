//Controls fund distribution to NGOs based on proof submission.
// SPDX-License-Identifier: MIT
// Specifies the license under which this code is distributed
pragma solidity ^0.8.19;

// Import of OpenZeppelin contracts for enhanced security and functionality
// Provides ownership control (only the owner can perform specific actions)
import "@openzeppelin/contracts/access/Ownable.sol";
// Interface for ERC-20 token interactions - enables interaction with USDT
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Ensures safe ERC-20 transfers, preventing silent failures and handling non-standard tokens
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// Prevents reentrancy attacks by adding a mutex mechanism
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface definitions for interacting with other contracts in the ecosystem
// Interface for the CampaignManager contract - manages campaign data
interface ICampaignManager {
    // Checks if a campaign with the given ID exists
    function campaignExists(uint256 campaignId) external view returns (bool);
    // Returns the NGO address associated with a campaign
    function getCampaignNGO(uint256 campaignId) external view returns (address);
    // Returns the funding goal for a campaign
    function getCampaignGoal(uint256 campaignId) external view returns (uint256);
}

// Interface for the DonationManager contract - tracks donations
interface IDonationManager {
    // Returns the total amount donated to a specific campaign
    function getCampaignDonationTotal(uint256 campaignId) external view returns (uint256);
}

// Interface for the ProofStorage contract - stores evidence of fund usage
interface IProofStorage {
    // Checks if a proof with the given ID exists
    function proofExists(bytes32 proofId) external view returns (bool);
    // Returns the campaign ID associated with a proof
    function getProofCampaign(bytes32 proofId) external view returns (uint256);
    // Returns the amount of funds requested in a proof
    function getProofAmount(bytes32 proofId) external view returns (uint256);
    // Returns the current status of a proof
    function getProofStatus(bytes32 proofId) external view returns (uint8);
    // Updates the status of a proof
    function setProofStatus(bytes32 proofId, uint8 status) external;
}

/**
 * @title FundReleaseManager
 * @dev Controls fund distribution to NGOs based on proof submission.
 * Funds are released in milestones, with the first milestone limited to 50% of collected donations.
 * This ensures NGOs must provide evidence of progress before receiving all funds.
 */
contract FundReleaseManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20; // Using SafeERC20 to prevent transfer failures

    // Interfaces for interacting with other contracts in the system
    ICampaignManager public campaignManager;    // Manages campaign information
    IDonationManager public donationManager;    // Tracks donation amounts
    IProofStorage public proofStorage;          // Stores proof submissions
    IERC20 public usdtToken;                    // The USDT token used for donations

    // Status constants for proof lifecycle - enables tracking of proof status
    uint8 public constant PROOF_STATUS_SUBMITTED = 1;    // Proof has been submitted by NGO
    uint8 public constant PROOF_STATUS_APPROVED = 2;     // Proof has been approved by validator
    uint8 public constant PROOF_STATUS_REJECTED = 3;     // Proof has been rejected by validator
    uint8 public constant PROOF_STATUS_FUNDS_RELEASED = 4; // Funds have been released for this proof

    // Events for important actions - these enable off-chain monitoring and transparency
    event FundsReleased(uint256 indexed campaignId, bytes32 indexed proofId, address ngo, uint256 amount);
    event ProofRejected(uint256 indexed campaignId, bytes32 indexed proofId, string reason);
    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    // Struct to track fund release records - creates a transparent history
    struct FundRelease {
        uint256 campaignId;  // Campaign the funds are for
        bytes32 proofId;     // Proof that triggered the release
        uint256 amount;      // Amount of USDT released
        uint256 timestamp;   // Time when funds were released
    }

    // State variables - store persistent contract data
    mapping(uint256 => uint256) public releasedFunds;           // Track total funds released per campaign
    mapping(uint256 => FundRelease[]) public fundReleaseHistory; // Historical record of fund releases
    mapping(address => bool) public validators;                  // Addresses authorized to validate proofs
    mapping(bytes32 => bool) public proofProcessed;              // Prevent double-processing of proofs

    // Custom access control modifier
    modifier onlyValidator() {
        require(validators[msg.sender] || owner() == msg.sender, "Not authorized as validator");
        _;
    }

    /**
     * @dev Constructor to initialize contract with required dependencies
     * @param _campaignManager Address of the CampaignManager contract
     * @param _donationManager Address of the DonationManager contract
     * @param _proofStorage Address of the ProofStorage contract
     * @param _usdtToken Address of the USDT token contract
     */
    constructor(
        address _campaignManager,
        address _donationManager,
        address _proofStorage,
        address _usdtToken
    ) Ownable(msg.sender) {
        // Initialize contract references
        campaignManager = ICampaignManager(_campaignManager);
        donationManager = IDonationManager(_donationManager);
        proofStorage = IProofStorage(_proofStorage);
        usdtToken = IERC20(_usdtToken);
        
        // Add contract creator as the first validator
        validators[msg.sender] = true;
        emit ValidatorAdded(msg.sender);
    }

    /**
     * @dev Add a new validator
     * @param _validator Address of the validator to add
     * 
     * Validators are trusted entities who can approve or reject proof submissions.
     * Only the contract owner can add new validators.
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
     * 
     * Allows the owner to revoke validator privileges.
     */
    function removeValidator(address _validator) external onlyOwner {
        require(validators[_validator], "Not a validator");
        
        validators[_validator] = false;
        emit ValidatorRemoved(_validator);
    }

    /**
     * @dev Approve a proof and release funds to the NGO
     * @param _proofId ID of the proof to approve
     * 
     * This is the main function that handles fund distribution:
     * 1. Validates the proof exists and is in the correct state
     * 2. Checks campaign and NGO validity
     * 3. Enforces the milestone funding rules
     * 4. Transfers funds to the NGO
     * 5. Updates all relevant state records
     */
    function approveProofAndReleaseFunds(bytes32 _proofId) external onlyValidator nonReentrant {
        // Security checks for proof validity
        require(proofStorage.proofExists(_proofId), "Proof does not exist");
        require(proofStorage.getProofStatus(_proofId) == PROOF_STATUS_SUBMITTED, "Proof not in submitted status");
        require(!proofProcessed[_proofId], "Proof already processed");

        // Get relevant details from the proof
        uint256 campaignId = proofStorage.getProofCampaign(_proofId);
        uint256 proofAmount = proofStorage.getProofAmount(_proofId);
        
        // Campaign must exist
        require(campaignManager.campaignExists(campaignId), "Campaign does not exist");
        
        // Get campaign and donation information
        address ngoAddress = campaignManager.getCampaignNGO(campaignId);
        uint256 campaignGoal = campaignManager.getCampaignGoal(campaignId);
        uint256 totalDonations = donationManager.getCampaignDonationTotal(campaignId);
        
        // Ensure valid NGO address
        require(ngoAddress != address(0), "Invalid NGO address");
        
        // Check sufficient funds are available
        uint256 availableFunds = totalDonations - releasedFunds[campaignId];
        require(availableFunds >= proofAmount, "Insufficient available funds");
        
        // First milestone rule: initial release limited to 50% of donations
        // This ensures NGOs must show progress before receiving all funds
        if (releasedFunds[campaignId] == 0) {
            require(proofAmount <= totalDonations / 2, "First release cannot exceed 50% of donations");
        }
        
        // Mark proof as approved in storage
        proofStorage.setProofStatus(_proofId, PROOF_STATUS_APPROVED);
        
        // Execute the fund transfer - nonReentrant prevents reentrancy attacks
        usdtToken.safeTransfer(ngoAddress, proofAmount);
        
        // Update accounting records
        releasedFunds[campaignId] += proofAmount;
        proofProcessed[_proofId] = true;
        
        // Record this release in history for transparency
        fundReleaseHistory[campaignId].push(FundRelease({
            campaignId: campaignId,
            proofId: _proofId,
            amount: proofAmount,
            timestamp: block.timestamp
        }));
        
        // Update proof status to indicate funds have been released
        proofStorage.setProofStatus(_proofId, PROOF_STATUS_FUNDS_RELEASED);
        
        // Emit event for off-chain tracking and transparency
        emit FundsReleased(campaignId, _proofId, ngoAddress, proofAmount);
    }

    /**
     * @dev Reject a proof
     * @param _proofId ID of the proof to reject
     * @param _reason Reason for rejection
     * 
     * Allows validators to reject invalid proofs with a reason.
     * This helps NGOs understand why their submission was rejected.
     */
    function rejectProof(bytes32 _proofId, string calldata _reason) external onlyValidator {
        require(proofStorage.proofExists(_proofId), "Proof does not exist");
        require(proofStorage.getProofStatus(_proofId) == PROOF_STATUS_SUBMITTED, "Proof not in submitted status");
        
        uint256 campaignId = proofStorage.getProofCampaign(_proofId);
        
        // Mark proof as rejected
        proofStorage.setProofStatus(_proofId, PROOF_STATUS_REJECTED);
        
        // Emit event with rejection reason for transparency
        emit ProofRejected(campaignId, _proofId, _reason);
    }

    /**
     * @dev Get the fund release history for a campaign
     * @param _campaignId ID of the campaign
     * @return FundRelease[] Array of fund releases for the campaign
     * 
     * Provides transparency on how funds have been released over time.
     */
    function getCampaignReleaseHistory(uint256 _campaignId) external view returns (FundRelease[] memory) {
        return fundReleaseHistory[_campaignId];
    }

    /**
     * @dev Get the available funds for a campaign
     * @param _campaignId ID of the campaign
     * @return uint256 Available funds for the campaign
     * 
     * Calculates remaining funds available for release.
     */
    function getAvailableFunds(uint256 _campaignId) external view returns (uint256) {
        uint256 totalDonations = donationManager.getCampaignDonationTotal(_campaignId);
        return totalDonations - releasedFunds[_campaignId];
    }

    /**
     * @dev Check if a campaign can receive a first milestone payment of the specified amount
     * @param _campaignId ID of the campaign
     * @param _amount Amount to check
     * @return bool Whether the first milestone payment is valid
     * 
     * Helper function to check milestone rules before submission.
     */
    function isValidFirstMilestone(uint256 _campaignId, uint256 _amount) external view returns (bool) {
        // First release must be 50% or less of total donations and campaign must have no prior releases
        if (releasedFunds[_campaignId] > 0) {
            return false;
        }
        
        uint256 totalDonations = donationManager.getCampaignDonationTotal(_campaignId);
        return _amount <= totalDonations / 2;
    }

    /**
     * @dev Emergency function to update contract addresses if needed
     * 
     * Provides a safety mechanism to update contract references if other
     * contracts need to be upgraded in the future.
     */
    function updateContractAddresses(
        address _campaignManager,
        address _donationManager,
        address _proofStorage,
        address _usdtToken
    ) external onlyOwner {
        require(_campaignManager != address(0), "Invalid campaign manager address");
        require(_donationManager != address(0), "Invalid donation manager address");
        require(_proofStorage != address(0), "Invalid proof storage address");
        require(_usdtToken != address(0), "Invalid USDT token address");
        
        campaignManager = ICampaignManager(_campaignManager);
        donationManager = IDonationManager(_donationManager);
        proofStorage = IProofStorage(_proofStorage);
        usdtToken = IERC20(_usdtToken);
    }
}

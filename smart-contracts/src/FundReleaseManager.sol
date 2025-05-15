// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Import interfaces for other contracts
import "./CampaignManager.sol";
import "./DonationManager.sol";
import "./ProofStorage.sol";

/**
 * @title FundReleaseManager
 * @dev Controls fund distribution to NGOs based on proof submission
 * Validator authorization is now handled in the microservices layer
 */
contract FundReleaseManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // External contract interfaces
    CampaignManager public campaignManager;    // Manages campaign information
    DonationManager public donationManager;    // Tracks donation amounts
    ProofStorage public proofStorage;          // Stores proof submissions
    IERC20 public usdtToken;                   // The USDT token used for donations

    // Struct to track fund release records
    struct FundRelease {
        uint256 campaignId;  // Campaign the funds are for
        bytes32 proofId;     // Proof that triggered the release
        uint256 amount;      // Amount of USDT released
        uint256 timestamp;   // Time when funds were released
    }

    // State variables
    mapping(uint256 => uint256) public releasedFunds;           // Track total funds released per campaign
    mapping(uint256 => FundRelease[]) public fundReleaseHistory; // Historical record of fund releases
    mapping(bytes32 => bool) public proofProcessed;              // Prevent double-processing of proofs

    // Events for transparency
    event FundsReleased(uint256 indexed campaignId, bytes32 indexed proofId, address ngo, uint256 amount);
    event ProofRejected(uint256 indexed campaignId, bytes32 indexed proofId, string reason);

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
        campaignManager = CampaignManager(_campaignManager);
        donationManager = DonationManager(_donationManager);
        proofStorage = ProofStorage(_proofStorage);
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @dev Approve a proof and release funds to the NGO
     * Validator checks removed - to be handled in microservices layer
     * @param _proofId ID of the proof to approve
     */
    function approveProofAndReleaseFunds(bytes32 _proofId) external nonReentrant {
        // Security checks for proof validity
        require(proofStorage.proofExists(_proofId), "Proof does not exist");
        require(proofStorage.getProofStatus(_proofId) == proofStorage.PROOF_STATUS_SUBMITTED(), "Proof not in submitted status");
        require(!proofProcessed[_proofId], "Proof already processed");

        // Get relevant details from the proof
        uint256 campaignId = proofStorage.getProofCampaign(_proofId);
        uint256 proofAmount = proofStorage.getProofAmount(_proofId);
        
        // Campaign must exist
        require(campaignManager.campaignExists(campaignId), "Campaign does not exist");
        
        // Get campaign and donation information
        address ngoAddress = campaignManager.getCampaignNGO(campaignId);
        uint256 totalDonations = donationManager.getCampaignDonationTotal(campaignId);
        
        // Ensure valid NGO address
        require(ngoAddress != address(0), "Invalid NGO address");
        
        // Check sufficient funds are available
        uint256 availableFunds = totalDonations - releasedFunds[campaignId];
        require(availableFunds >= proofAmount, "Insufficient available funds");
        
        // First milestone rule: initial release limited to 50% of donations
        if (releasedFunds[campaignId] == 0) {
            require(proofAmount <= totalDonations / 2, "First release cannot exceed 50% of donations");
        }
        
        // Mark proof as approved in storage
        proofStorage.setProofStatus(_proofId, proofStorage.PROOF_STATUS_APPROVED());
        
        // Execute the fund transfer
        usdtToken.safeTransferFrom(address(donationManager), ngoAddress, proofAmount);
        
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
        proofStorage.setProofStatus(_proofId, proofStorage.PROOF_STATUS_FUNDS_RELEASED());
        
        // Emit event for off-chain tracking and transparency
        emit FundsReleased(campaignId, _proofId, ngoAddress, proofAmount);
    }

    /**
     * @dev Reject a proof
     * Validator checks removed - to be handled in microservices layer
     * @param _proofId ID of the proof to reject
     * @param _reason Reason for rejection
     */
    function rejectProof(bytes32 _proofId, string memory _reason) external {
        require(proofStorage.proofExists(_proofId), "Proof does not exist");
        require(proofStorage.getProofStatus(_proofId) == proofStorage.PROOF_STATUS_SUBMITTED(), "Proof not in submitted status");
        require(!proofProcessed[_proofId], "Proof already processed");
        
        // Get campaign ID for event emission
        uint256 campaignId = proofStorage.getProofCampaign(_proofId);
        
        // Mark proof as rejected
        proofStorage.setProofStatus(_proofId, proofStorage.PROOF_STATUS_REJECTED());
        proofProcessed[_proofId] = true;
        
        emit ProofRejected(campaignId, _proofId, _reason);
    }

    /**
     * @dev Get total funds released for a campaign
     * @param _campaignId ID of the campaign
     * @return uint256 Total funds released in USDT
     */
    function getTotalReleasedFunds(uint256 _campaignId) external view returns (uint256) {
        return releasedFunds[_campaignId];
    }

    /**
     * @dev Get history of fund releases for a campaign
     * @param _campaignId ID of the campaign
     * @return FundRelease[] Array of fund release records
     */
    function getFundReleaseHistory(uint256 _campaignId) external view returns (FundRelease[] memory) {
        return fundReleaseHistory[_campaignId];
    }

    /**
     * @dev Calculate remaining funds available for a campaign
     * @param _campaignId ID of the campaign
     * @return uint256 Remaining available funds in USDT
     */
    function getAvailableFunds(uint256 _campaignId) external view returns (uint256) {
        uint256 totalDonations = donationManager.getCampaignDonationTotal(_campaignId);
        return totalDonations - releasedFunds[_campaignId];
    }

    /**
     * @dev Check if a campaign has reached its first milestone (50% funding)
     * @param _campaignId ID of the campaign
     * @return bool Whether the campaign has reached 50% funding
     */
    function hasReachedFirstMilestone(uint256 _campaignId) external view returns (bool) {
        uint256 totalDonations = donationManager.getCampaignDonationTotal(_campaignId);
        uint256 goal = campaignManager.getCampaignGoal(_campaignId);
        
        return totalDonations >= (goal / 2);
    }

    /**
     * @dev Check if a campaign has reached its full funding goal
     * @param _campaignId ID of the campaign
     * @return bool Whether the campaign has reached 100% funding
     */
    function hasReachedFullFunding(uint256 _campaignId) external view returns (bool) {
        uint256 totalDonations = donationManager.getCampaignDonationTotal(_campaignId);
        uint256 goal = campaignManager.getCampaignGoal(_campaignId);
        
        return totalDonations >= goal;
    }
}
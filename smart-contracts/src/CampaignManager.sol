// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CampaignManager
 * @dev Manages the creation and tracking of fundraising campaigns
 */
contract CampaignManager is Ownable, ReentrancyGuard, Pausable {
    // Struct to store campaign information
    struct Campaign {
        uint256 id;              // Unique campaign identifier
        address ngo;             // NGO address that owns this campaign
        string title;            // Campaign title
        string description;      // Detailed campaign description
        uint256 fundingGoal;     // Funding goal in USDT
        uint256 deadline;        // Deadline in Unix timestamp
        bool verified;           // Whether the campaign has been verified
        bool active;             // Whether the campaign is currently active
        uint256 timestamp;       // When the campaign was created
    }

    // State variables
    uint256 private campaignCount;                    // Campaign counter
    mapping(uint256 => Campaign) private campaigns;   // Mapping of campaigns by ID
    mapping(address => uint256[]) private ngoCampaigns; // Campaigns by NGO
    mapping(address => bool) public verifiers;        // Authorized campaign verifiers

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed ngo, string title, uint256 fundingGoal);
    event CampaignVerified(uint256 indexed campaignId, address indexed verifier);
    event CampaignActivated(uint256 indexed campaignId);
    event CampaignDeactivated(uint256 indexed campaignId);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    // Modifiers
    modifier onlyVerifier() {
        require(verifiers[msg.sender] || owner() == msg.sender, "Not authorized as verifier");
        _;
    }

    modifier campaignExistsModifier(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        _;
    }

    /**
     * @dev Constructor adds the contract deployer as the first verifier
     */
    constructor() Ownable(msg.sender) {
        verifiers[msg.sender] = true;
        emit VerifierAdded(msg.sender);
    }

    /**
     * @dev Add a new verifier
     * @param _verifier Address of the verifier to add
     */
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        require(!verifiers[_verifier], "Already a verifier");
        
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    /**
     * @dev Remove a verifier
     * @param _verifier Address of the verifier to remove
     */
    function removeVerifier(address _verifier) external onlyOwner {
        require(verifiers[_verifier], "Not a verifier");
        
        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    /**
     * @dev Create a new campaign
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _fundingGoal Funding goal in USDT
     * @param _durationInDays Campaign duration in days
     * @return uint256 The ID of the created campaign
     *
     * NGOs call this to initiate a new fundraising campaign
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _durationInDays
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_fundingGoal > 0, "Funding goal must be greater than zero");
        require(_durationInDays > 0, "Duration must be greater than zero");

        // Increment campaign counter
        campaignCount++;
        
        // Create the campaign
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            ngo: msg.sender,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            deadline: block.timestamp + (_durationInDays * 1 days),
            verified: false,
            active: false,
            timestamp: block.timestamp
        });
        
        // Track this campaign for the NGO
        ngoCampaigns[msg.sender].push(campaignCount);
        
        emit CampaignCreated(campaignCount, msg.sender, _title, _fundingGoal);
        return campaignCount;
    }

    /**
     * @dev Verify a campaign
     * @param _campaignId ID of the campaign to verify
     *
     * Verifiers call this after reviewing campaign details and NGO credentials
     */
    function verifyCampaign(uint256 _campaignId) external campaignExistsModifier(_campaignId) onlyVerifier {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.verified, "Campaign already verified");
        
        campaign.verified = true;
        emit CampaignVerified(_campaignId, msg.sender);
    }

    /**
     * @dev Activate a campaign to allow donations
     * @param _campaignId ID of the campaign to activate
     *
     * Only verifiers can activate a campaign after verification
     */
    function activateCampaign(uint256 _campaignId) external campaignExistsModifier(_campaignId) onlyVerifier {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.verified, "Campaign must be verified first");
        require(!campaign.active, "Campaign already active");
        
        campaign.active = true;
        emit CampaignActivated(_campaignId);
    }

    /**
     * @dev Deactivate a campaign to pause donations
     * @param _campaignId ID of the campaign to deactivate
     *
     * Only verifiers can deactivate a campaign
     */
    function deactivateCampaign(uint256 _campaignId) external campaignExistsModifier(_campaignId) onlyVerifier {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.active, "Campaign already inactive");
        
        campaign.active = false;
        emit CampaignDeactivated(_campaignId);
    }

    /**
     * @dev Check if a campaign exists
     * @param _campaignId ID of the campaign
     * @return bool Whether the campaign exists
     */
    function campaignExists(uint256 _campaignId) public view returns (bool) {
        return _campaignId > 0 && _campaignId <= campaignCount;
    }

    /**
     * @dev Get the NGO address associated with a campaign
     * @param _campaignId ID of the campaign
     * @return address NGO address
     */
    function getCampaignNGO(uint256 _campaignId) external view campaignExistsModifier(_campaignId) returns (address) {
        return campaigns[_campaignId].ngo;
    }

    /**
     * @dev Get the funding goal for a campaign
     * @param _campaignId ID of the campaign
     * @return uint256 Funding goal in USDT
     */
    function getCampaignGoal(uint256 _campaignId) external view campaignExistsModifier(_campaignId) returns (uint256) {
        return campaigns[_campaignId].fundingGoal;
    }

    /**
     * @dev Get full campaign details
     * @param _campaignId ID of the campaign
     * @return Campaign struct containing all campaign details
     */
    function getCampaign(uint256 _campaignId) external view campaignExistsModifier(_campaignId) returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    /**
     * @dev Get all campaigns created by an NGO
     * @param _ngo Address of the NGO
     * @return uint256[] Array of campaign IDs
     */
    function getNGOCampaigns(address _ngo) external view returns (uint256[] memory) {
        return ngoCampaigns[_ngo];
    }

    /**
     * @dev Check if a campaign is active for donations
     * @param _campaignId ID of the campaign
     * @return bool Whether the campaign is active
     */
    function isCampaignActive(uint256 _campaignId) external view campaignExistsModifier(_campaignId) returns (bool) {
        Campaign storage campaign = campaigns[_campaignId];
        return campaign.active && campaign.verified && block.timestamp <= campaign.deadline;
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
//Manages fundraising campaigns (creation, tracking, status).
// Manages fundraising campaigns (creation, tracking, status).
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CampaignManager
 * @dev Manages the creation, tracking, and status of fundraising campaigns
 */
contract CampaignManager {
    // Structure to store campaign information
    struct Campaign {
        uint256 id;                // Unique campaign identifier
        address creator;           // Campaign creator's address
        string title;              // Campaign title
        string description;        // Detailed campaign description
        uint256 fundingGoal;       // Funding goal in wei
        uint256 deadline;          // Deadline in Unix timestamp
        uint256 amountRaised;      // Total amount collected in wei
        bool isClosed;             // Indicates if the campaign is closed
        bool isSuccessful;         // Indicates if the campaign reached its goal
    }

    // State variables
    uint256 private campaignCount;              // Campaign counter
    mapping(uint256 => Campaign) public campaigns;  // Mapping of campaigns by ID
    mapping(uint256 => mapping(address => uint256)) public donations;  // Donations by campaign and address
    mapping(uint256 => address[]) public donators;  // List of donors per campaign

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 fundingGoal);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event CampaignClosed(uint256 indexed campaignId, bool isSuccessful, uint256 amountRaised);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed recipient, uint256 amount);

    // Modifiers
    modifier onlyCampaignCreator(uint256 _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Only the campaign creator can perform this action");
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "The campaign does not exist");
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        require(!campaigns[_campaignId].isClosed, "The campaign is already closed");
        require(block.timestamp < campaigns[_campaignId].deadline, "The campaign has exceeded its deadline");
        _;
    }

    /**
     * @dev Creates a new fundraising campaign
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _fundingGoal Funding goal in wei
     * @param _durationInDays Campaign duration in days
     * @return ID of the created campaign
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _durationInDays
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "The title cannot be empty");
        require(_fundingGoal > 0, "The funding goal must be greater than zero");
        require(_durationInDays > 0, "The duration must be greater than zero");

        campaignCount++;
        uint256 campaignId = campaignCount;

        campaigns[campaignId] = Campaign({
            id: campaignId,
            creator: msg.sender,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            deadline: block.timestamp + (_durationInDays * 1 days),
            amountRaised: 0,
            isClosed: false,
            isSuccessful: false
        });

        emit CampaignCreated(campaignId, msg.sender, _title, _fundingGoal);
        return campaignId;
    }

    /**
     * @dev Allows a user to donate to a campaign
     * @param _campaignId Campaign ID
     */
    function donate(uint256 _campaignId) external payable campaignExists(_campaignId) campaignActive(_campaignId) {
        require(msg.value > 0, "The donation amount must be greater than zero");

        Campaign storage campaign = campaigns[_campaignId];
        
        // If this is the user's first donation for this campaign, add to the donor list
        if (donations[_campaignId][msg.sender] == 0) {
            donators[_campaignId].push(msg.sender);
        }
        
        // Update the donation amount for this user
        donations[_campaignId][msg.sender] += msg.value;
        
        // Update the total amount collected
        campaign.amountRaised += msg.value;
        
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    /**
     * @dev Closes a campaign (manually or automatically)
     * @param _campaignId Campaign ID
     */
    function closeCampaign(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        
        // The campaign can be closed by its creator or if the deadline is exceeded
        require(campaign.creator == msg.sender || block.timestamp >= campaign.deadline, 
                "Only the creator can close the campaign before its deadline");
        require(!campaign.isClosed, "The campaign is already closed");
        
        campaign.isClosed = true;
        campaign.isSuccessful = campaign.amountRaised >= campaign.fundingGoal;
        
        emit CampaignClosed(_campaignId, campaign.isSuccessful, campaign.amountRaised);
    }

    /**
     * @dev Allows the creator to withdraw funds after a successful campaign
     * @param _campaignId Campaign ID
     */
    function withdrawFunds(uint256 _campaignId) external campaignExists(_campaignId) onlyCampaignCreator(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.isClosed, "The campaign must be closed");
        require(campaign.isSuccessful, "The campaign did not reach its goal");
        require(campaign.amountRaised > 0, "No funds to withdraw");
        
        uint256 amountToWithdraw = campaign.amountRaised;
        campaign.amountRaised = 0;
        
        // Transfer funds to the creator
        (bool success, ) = payable(campaign.creator).call{value: amountToWithdraw}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(_campaignId, campaign.creator, amountToWithdraw);
    }
 
    function getCampaignDetails(uint256 _campaignId) external view campaignExists(_campaignId) returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 deadline,
        uint256 amountRaised,
        bool isClosed,
        bool isSuccessful
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.id,
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.fundingGoal,
            campaign.deadline,
            campaign.amountRaised,
            campaign.isClosed,
            campaign.isSuccessful
        );
    }

    /**
     * @dev Retrieves the total number of campaigns
     * @return The number of campaigns
     */
    function getCampaignCount() external view returns (uint256) {
        return campaignCount;
    }

    /**
     * @dev Retrieves the list of donors for a campaign
     * @param _campaignId Campaign ID
     * @return List of donor addresses
     */
    function getCampaignDonators(uint256 _campaignId) external view campaignExists(_campaignId) returns (address[] memory) {
        return donators[_campaignId];
    }

    /**
     * @dev Checks if a campaign is active
     * @param _campaignId Campaign ID
     * @return true if the campaign is active, false otherwise
     */
    function isCampaignActive(uint256 _campaignId) external view campaignExists(_campaignId) returns (bool) {
        Campaign storage campaign = campaigns[_campaignId];
        return (!campaign.isClosed && block.timestamp < campaign.deadline);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Import the CampaignManager interface
import "./CampaignManager.sol";

/**
 * @title DonationManager
 * @dev Manages the collection of donations for campaigns
 */
contract DonationManager is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // USDT token interface
    IERC20 public usdtToken;
    
    // Campaign Manager contract interface
    CampaignManager public campaignManager;
    
    // Track donations
    mapping(uint256 => uint256) public campaignDonations;          // Total donations per campaign
    mapping(address => mapping(uint256 => uint256)) public userDonations; // Donations by user per campaign
    mapping(uint256 => address[]) private campaignDonors;          // List of donors per campaign
    
    // Minimum donation amount (in USDT units)
    uint256 public minDonationAmount;
    
    // Address authorized to transfer funds (FundReleaseManager)
    address public fundReleaseManager;
    
    // Events
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event MinDonationAmountUpdated(uint256 previousAmount, uint256 newAmount);
    event FundReleaseManagerApproved(address fundReleaseManager);
    
    /**
     * @dev Constructor initializes the contract with required dependencies
     * @param _usdtToken Address of the USDT token contract
     * @param _campaignManager Address of the Campaign Manager contract
     * @param _minDonationAmount Minimum donation amount in USDT units
     */
    constructor(
        address _usdtToken,
        address _campaignManager,
        uint256 _minDonationAmount
    ) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT token address");
        require(_campaignManager != address(0), "Invalid campaign manager address");
        
        usdtToken = IERC20(_usdtToken);
        campaignManager = CampaignManager(_campaignManager);
        minDonationAmount = _minDonationAmount;
    }
    
    /**
     * @dev Donate USDT to a campaign
     * @param _campaignId ID of the campaign to donate to
     * @param _amount Amount of USDT to donate
     *
     * Donors call this to contribute to campaigns
     */
    function donate(uint256 _campaignId, uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount >= minDonationAmount, "Donation below minimum amount");
        require(campaignManager.campaignExists(_campaignId), "Campaign does not exist");
        require(campaignManager.isCampaignActive(_campaignId), "Campaign is not active");
        
        // Transfer USDT from donor to this contract
        usdtToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Update donation records
        if (userDonations[msg.sender][_campaignId] == 0) {
            campaignDonors[_campaignId].push(msg.sender);
        }
        
        userDonations[msg.sender][_campaignId] += _amount;
        campaignDonations[_campaignId] += _amount;
        
        emit DonationReceived(_campaignId, msg.sender, _amount);
    }
    
    /**
     * @dev Get the total amount donated to a campaign
     * @param _campaignId ID of the campaign
     * @return uint256 Total donations in USDT
     */
    function getCampaignDonationTotal(uint256 _campaignId) external view returns (uint256) {
        return campaignDonations[_campaignId];
    }
    
    /**
     * @dev Get the list of donors for a campaign
     * @param _campaignId ID of the campaign
     * @return address[] Array of donor addresses
     */
    function getCampaignDonors(uint256 _campaignId) external view returns (address[] memory) {
        return campaignDonors[_campaignId];
    }
    
    /**
     * @dev Get the donation amount from a specific donor to a campaign
     * @param _donor Address of the donor
     * @param _campaignId ID of the campaign
     * @return uint256 Donation amount in USDT
     */
    function getDonationAmount(address _donor, uint256 _campaignId) external view returns (uint256) {
        return userDonations[_donor][_campaignId];
    }
    
    /**
     * @dev Set the minimum donation amount
     * @param _minDonationAmount New minimum donation amount
     *
     * Only owner can change the minimum donation amount
     */
    function setMinDonationAmount(uint256 _minDonationAmount) external onlyOwner {
        uint256 oldAmount = minDonationAmount;
        minDonationAmount = _minDonationAmount;
        emit MinDonationAmountUpdated(oldAmount, _minDonationAmount);
    }
    
    /**
     * @dev Get the USDT balance held by this contract
     * @return uint256 Balance in USDT
     */
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
    
    /**
     * @dev Approve the FundReleaseManager to spend USDT
     * @param _fundReleaseManager Address of the FundReleaseManager contract
     *
     * Called by owner when setting up the FundReleaseManager
     */
    function approveFundReleaseManager(address _fundReleaseManager) external onlyOwner {
        require(_fundReleaseManager != address(0), "Invalid fund release manager address");
        
        // Store the fund release manager address
        fundReleaseManager = _fundReleaseManager;
        
        // Approve fund release manager to spend tokens
        usdtToken.approve(_fundReleaseManager, type(uint256).max);
        
        emit FundReleaseManagerApproved(_fundReleaseManager);
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
    
    /**
     * @dev Emergency function to recover tokens sent by mistake
     * @param _token Address of the token to recover
     * @param _amount Amount to recover
     *
     * Only owner can recover tokens
     */
    function recoverToken(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(_amount > 0, "Amount must be greater than zero");
        
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}
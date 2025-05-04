// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DonationManager
 * @dev Manages donations in USDT with focus on secure collection of funds
 */
contract DonationManager is Ownable, ReentrancyGuard, Pausable {
    IERC20 public usdt;
    
    // Track individual donations
    mapping(address => uint256) public donations;
    
    // Track total donations received
    uint256 public totalDonationsReceived;
    
    // Minimum donation amount (in USDT units)
    uint256 public minDonationAmount;
    
    // Contract addresses for the other components of the system
    address public fundDistributorContract;
    address public proofStorageContract;
    address public campaignManagerContract;
    
    // Events for transparency
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp, string campaignId);
    event FundsTransferred(address indexed to, uint256 amount, uint256 timestamp);
    event MinDonationAmountUpdated(uint256 previousAmount, uint256 newAmount);
    event SystemContractUpdated(string contractType, address previousAddress, address newAddress);
    
    /**
     * @dev Initialize the contract with the USDT token address
     * @param _usdtAddress The address of the USDT token contract
     * @param _minDonationAmount Minimum donation amount in USDT units
     */
    constructor(address _usdtAddress, uint256 _minDonationAmount) Ownable(msg.sender) {
        require(_usdtAddress != address(0), "Invalid USDT address");
        usdt = IERC20(_usdtAddress);
        minDonationAmount = _minDonationAmount;
    }
    
    /**
     * @dev Allow users to donate USDT to the contract for a specific campaign
     * @param amount The amount to donate
     * @param campaignId The ID of the campaign being donated to
     */
    function donate(uint256 amount, string memory campaignId) external nonReentrant whenNotPaused {
        require(amount >= minDonationAmount, "Donation below minimum amount");
        require(bytes(campaignId).length > 0, "Campaign ID required");
        
        // Check allowance before transfer
        require(usdt.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer USDT from donor to contract
        bool success = usdt.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        
        // Update donor records
        donations[msg.sender] += amount;
        totalDonationsReceived += amount;
        
        // Emit event with timestamp and campaign ID for transparency
        emit DonationReceived(msg.sender, amount, block.timestamp, campaignId);
    }
    
    /**
     * @dev Transfer funds to the fund distributor contract
     * @param amount The amount to transfer
     */
    function transferToDistributor(uint256 amount) external onlyOwner nonReentrant {
        require(fundDistributorContract != address(0), "Distributor not set");
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= usdt.balanceOf(address(this)), "Insufficient balance");
        
        bool success = usdt.transfer(fundDistributorContract, amount);
        require(success, "Transfer failed");
        
        emit FundsTransferred(fundDistributorContract, amount, block.timestamp);
    }
    
    /**
     * @dev Set the minimum donation amount
     * @param _minDonationAmount New minimum donation amount
     */
    function setMinDonationAmount(uint256 _minDonationAmount) external onlyOwner {
        uint256 oldAmount = minDonationAmount;
        minDonationAmount = _minDonationAmount;
        emit MinDonationAmountUpdated(oldAmount, _minDonationAmount);
    }
    
    /**
     * @dev Set the fund distributor contract address
     * @param _fundDistributorContract The address of the fund distributor contract
     */
    function setFundDistributorContract(address _fundDistributorContract) external onlyOwner {
        require(_fundDistributorContract != address(0), "Invalid address");
        address oldAddress = fundDistributorContract;
        fundDistributorContract = _fundDistributorContract;
        emit SystemContractUpdated("FundDistributor", oldAddress, _fundDistributorContract);
    }
    
    /**
     * @dev Set the proof storage contract address
     * @param _proofStorageContract The address of the proof storage contract
     */
    function setProofStorageContract(address _proofStorageContract) external onlyOwner {
        require(_proofStorageContract != address(0), "Invalid address");
        address oldAddress = proofStorageContract;
        proofStorageContract = _proofStorageContract;
        emit SystemContractUpdated("ProofStorage", oldAddress, _proofStorageContract);
    }
    
    /**
     * @dev Set the campaign manager contract address
     * @param _campaignManagerContract The address of the campaign manager contract
     */
    function setCampaignManagerContract(address _campaignManagerContract) external onlyOwner {
        require(_campaignManagerContract != address(0), "Invalid address");
        address oldAddress = campaignManagerContract;
        campaignManagerContract = _campaignManagerContract;
        emit SystemContractUpdated("CampaignManager", oldAddress, _campaignManagerContract);
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get the donation amount for a specific donor
     * @param donor The address of the donor
     * @return The amount donated
     */
    function getDonationByDonor(address donor) external view returns (uint256) {
        return donations[donor];
    }
    
    /**
     * @dev Get the total donations received by the contract
     * @return The total balance of USDT in the contract
     */
    function getContractBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency function to recover tokens sent by mistake
     * @param tokenAddress The address of the token to recover
     */
    function recoverToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        
        bool success = token.transfer(owner(), balance);
        require(success, "Recovery failed");
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DonationManager.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDT token for testing
contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "mUSDT") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract DonationManagerTest is Test {
    DonationManager public donationManager;
    MockUSDT public mockUSDT;
    
    address public owner;
    address public donor1;
    address public donor2;
    address public fundDistributor;
    address public proofStorage;
    address public campaignManager;
    
    uint256 public constant MIN_DONATION = 10 * 10**6; // 10 USDT with 6 decimals
    
    function setUp() public {
        // Setup accounts
        owner = address(this);
        donor1 = address(0x1);
        donor2 = address(0x2);
        fundDistributor = address(0x3);
        proofStorage = address(0x4);
        campaignManager = address(0x5);
        
        // Deploy mock USDT
        mockUSDT = new MockUSDT();
        
        // Deploy DonationManager with mock USDT
        donationManager = new DonationManager(address(mockUSDT), MIN_DONATION);
        
        // Setup system contracts
        donationManager.setFundDistributorContract(fundDistributor);
        donationManager.setProofStorageContract(proofStorage);
        donationManager.setCampaignManagerContract(campaignManager);
        
        // Fund test accounts and approve spending
        mockUSDT.transfer(donor1, 1000 * 10**6); // 1000 USDT
        mockUSDT.transfer(donor2, 500 * 10**6);  // 500 USDT
        
        vm.startPrank(donor1);
        mockUSDT.approve(address(donationManager), 1000 * 10**6);
        vm.stopPrank();
        
        vm.startPrank(donor2);
        mockUSDT.approve(address(donationManager), 500 * 10**6);
        vm.stopPrank();
    }
    
    // Test basic donation functionality
    function testDonate() public {
        uint256 donationAmount = 100 * 10**6; // 100 USDT
        string memory campaignId = "education-campaign";
        
        vm.prank(donor1);
        donationManager.donate(donationAmount, campaignId);
        
        assertEq(donationManager.getDonationByDonor(donor1), donationAmount);
        assertEq(donationManager.totalDonationsReceived(), donationAmount);
        assertEq(donationManager.getContractBalance(), donationAmount);
    }
    
    // Test transferring funds to distributor
    function testTransferToDistributor() public {
        // First make a donation
        vm.prank(donor1);
        donationManager.donate(100 * 10**6, "education-campaign");
        
        // Then transfer funds to the distributor
        donationManager.transferToDistributor(50 * 10**6);
        
        // Verify balances
        assertEq(donationManager.getContractBalance(), 50 * 10**6);
        assertEq(mockUSDT.balanceOf(fundDistributor), 50 * 10**6);
    }
    
    // Test donation below minimum amount (should revert)
    function test_RevertWhen_DonationBelowMinAmount() public {
        uint256 belowMinAmount = MIN_DONATION - 1;
        
        vm.prank(donor1);
        vm.expectRevert("Donation below minimum amount");
        donationManager.donate(belowMinAmount, "education-campaign");
    }
    
    // Test pause functionality
    // In DonationManagerTest.sol
function testPauseContract() public {
    // Owner pauses the contract
    vm.prank(owner);
    donationManager.pause();
    
    // Try to donate while paused (should revert with "EnforcedPause()")
    vm.prank(donor1);
    vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
    donationManager.donate(100 * 10**6, "education-campaign");
}
    
    // Test unpause functionality
    function testUnpauseContract() public {
        // First pause the contract
        donationManager.pause();
        
        // Then unpause it
        donationManager.unpause();
        
        // Should be able to donate after unpausing
        vm.prank(donor1);
        donationManager.donate(100 * 10**6, "education-campaign");
        
        assertEq(donationManager.getDonationByDonor(donor1), 100 * 10**6);
    }
    
    // Test token recovery functionality
    function testRecoverToken() public {
    // First make a donation using the main token
    vm.prank(donor1);
    donationManager.donate(100 * 10**6, "education-campaign");
    
    // Get the owner's balance before recovery
    uint256 balanceBefore = mockUSDT.balanceOf(owner);
    
    // Recover the token
    vm.prank(owner);
    donationManager.recoverToken(address(mockUSDT));
    
    // Get the owner's balance after recovery
    uint256 balanceAfter = mockUSDT.balanceOf(owner);
    
    // The owner's balance should have increased by exactly the recovered amount
    assertEq(balanceAfter - balanceBefore, 100 * 10**6);
    
    // The DonationManager should now have 0 tokens
    assertEq(mockUSDT.balanceOf(address(donationManager)), 0);
}
}
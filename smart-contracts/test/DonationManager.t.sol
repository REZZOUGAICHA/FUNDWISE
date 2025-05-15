// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "forge-std/Test.sol";
// import "../src/CampaignManager.sol";

// contract CampaignManagerTest is Test {
//     CampaignManager public campaignManager;
    
//     // Test accounts
//     address public creator = address(0x1);
//     address public donor1 = address(0x2);
//     address public donor2 = address(0x3);
    
//     // Test data
//     string public constant TITLE = "Test Campaign";
//     string public constant DESCRIPTION = "A campaign for testing purposes";
//     uint256 public constant FUNDING_GOAL = 10 ether;
//     uint256 public constant DURATION = 30; // 30 days
    
//     // Events for testing
//     event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 fundingGoal);
//     event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
//     event CampaignClosed(uint256 indexed campaignId, bool isSuccessful, uint256 amountRaised);
//     event FundsWithdrawn(uint256 indexed campaignId, address indexed recipient, uint256 amount);
    
//     function setUp() public {
//         campaignManager = new CampaignManager();
//         vm.deal(creator, 100 ether);
//         vm.deal(donor1, 100 ether);
//         vm.deal(donor2, 100 ether);
//     }
    
//     function testCreateCampaign() public {
//         vm.startPrank(creator);
        
//         vm.expectEmit(true, true, false, true);
//         emit CampaignCreated(1, creator, TITLE, FUNDING_GOAL);
        
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
        
//         assertEq(campaignId, 1, "Campaign ID should be 1");
//         assertEq(campaignManager.getCampaignCount(), 1, "Campaign count should be 1");
        
//         (
//             uint256 id,
//             address campaignCreator,
//             string memory title,
//             string memory description,
//             uint256 fundingGoal,
//             ,  // deadline
//             uint256 amountRaised,
//             bool isClosed,
//             bool isSuccessful
//         ) = campaignManager.getCampaignDetails(campaignId);
        
//         assertEq(id, 1, "Campaign ID should be 1");
//         assertEq(campaignCreator, creator, "Campaign creator should be the creator address");
//         assertEq(title, TITLE, "Campaign title should match");
//         assertEq(description, DESCRIPTION, "Campaign description should match");
//         assertEq(fundingGoal, FUNDING_GOAL, "Campaign funding goal should match");
//         assertEq(amountRaised, 0, "Amount raised should be 0");
//         assertEq(isClosed, false, "Campaign should not be closed");
//         assertEq(isSuccessful, false, "Campaign should not be marked successful");
        
//         vm.stopPrank();
//     }
    
//     function testCreateCampaignWithInvalidParams() public {
//         vm.startPrank(creator);
        
//         // Empty title
//         vm.expectRevert("The title cannot be empty");
//         campaignManager.createCampaign("", DESCRIPTION, FUNDING_GOAL, DURATION);
        
//         // Zero funding goal
//         vm.expectRevert("The funding goal must be greater than zero");
//         campaignManager.createCampaign(TITLE, DESCRIPTION, 0, DURATION);
        
//         // Zero duration
//         vm.expectRevert("The duration must be greater than zero");
//         campaignManager.createCampaign(TITLE, DESCRIPTION, FUNDING_GOAL, 0);
        
//         vm.stopPrank();
//     }
    
//     function testDonate() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Donate to the campaign
//         vm.startPrank(donor1);
//         uint256 donationAmount = 1 ether;
        
//         vm.expectEmit(true, true, false, true);
//         emit DonationReceived(campaignId, donor1, donationAmount);
        
//         campaignManager.donate{value: donationAmount}(campaignId);
        
//         // Check donation was recorded
//         (,,,,, uint256 deadline, uint256 amountRaised,,) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(amountRaised, donationAmount, "Amount raised should match donation");
//         assertEq(campaignManager.donations(campaignId, donor1), donationAmount, "Donation should be recorded for donor1");
        
//         // Check donor was added to the donators list
//         address[] memory donators = campaignManager.getCampaignDonators(campaignId);
//         assertEq(donators.length, 1, "Should have 1 donator");
//         assertEq(donators[0], donor1, "Donator should be donor1");
        
//         vm.stopPrank();
//     }
    
//     function testMultipleDonations() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // First donation from donor1
//         vm.startPrank(donor1);
//         campaignManager.donate{value: 1 ether}(campaignId);
//         vm.stopPrank();
        
//         // Second donation from donor1
//         vm.startPrank(donor1);
//         campaignManager.donate{value: 2 ether}(campaignId);
//         vm.stopPrank();
        
//         // Donation from donor2
//         vm.startPrank(donor2);
//         campaignManager.donate{value: 3 ether}(campaignId);
//         vm.stopPrank();
        
//         // Check donation totals
//         (,,,,, uint256 deadline, uint256 amountRaised,,) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(amountRaised, 6 ether, "Total amount raised should be 6 ether");
//         assertEq(campaignManager.donations(campaignId, donor1), 3 ether, "Donor1 total should be 3 ether");
//         assertEq(campaignManager.donations(campaignId, donor2), 3 ether, "Donor2 total should be 3 ether");
        
//         // Check donators list
//         address[] memory donators = campaignManager.getCampaignDonators(campaignId);
//         assertEq(donators.length, 2, "Should have 2 unique donators");
//     }
    
//     function testDonateToNonExistentCampaign() public {
//         vm.startPrank(donor1);
//         vm.expectRevert("The campaign does not exist");
//         campaignManager.donate{value: 1 ether}(999);
//         vm.stopPrank();
//     }
    
//     function testDonateWithZeroValue() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         vm.startPrank(donor1);
//         vm.expectRevert("The donation amount must be greater than zero");
//         campaignManager.donate{value: 0}(campaignId);
//         vm.stopPrank();
//     }
    
//     function testDonateToClosedCampaign() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         // Close the campaign
//         campaignManager.closeCampaign(campaignId);
//         vm.stopPrank();
        
//         vm.startPrank(donor1);
//         vm.expectRevert("The campaign is already closed");
//         campaignManager.donate{value: 1 ether}(campaignId);
//         vm.stopPrank();
//     }
    
//     function testDonateToExpiredCampaign() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Advance time past the deadline
//         vm.warp(block.timestamp + (DURATION * 1 days) + 1);
        
//         vm.startPrank(donor1);
//         vm.expectRevert("The campaign has exceeded its deadline");
//         campaignManager.donate{value: 1 ether}(campaignId);
//         vm.stopPrank();
//     }
    
//     function testCloseCampaign() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
        
//         vm.expectEmit(true, false, false, true);
//         emit CampaignClosed(campaignId, false, 0);
        
//         campaignManager.closeCampaign(campaignId);
        
//         // Check campaign is closed
//         (,,,,,,, bool isClosed, bool isSuccessful) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(isClosed, true, "Campaign should be closed");
//         assertEq(isSuccessful, false, "Campaign should not be successful");
        
//         vm.stopPrank();
//     }
    
//     function testCloseCampaignAsNonCreator() public {
//         // Create a campaign first
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Try to close as non-creator before deadline
//         vm.startPrank(donor1);
//         vm.expectRevert("Only the creator can close the campaign before its deadline");
//         campaignManager.closeCampaign(campaignId);
//         vm.stopPrank();
        
//         // Advance time past the deadline
//         vm.warp(block.timestamp + (DURATION * 1 days) + 1);
        
//         // Now anyone can close it
//         vm.startPrank(donor1);
//         campaignManager.closeCampaign(campaignId);
//         (,,,,,,, bool isClosed, bool isSuccessful) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(isClosed, true, "Campaign should be closed after deadline even by non-creator");
//         vm.stopPrank();
//     }
    
//     function testCloseAlreadyClosedCampaign() public {
//         // Create and close a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         campaignManager.closeCampaign(campaignId);
        
//         // Try to close it again
//         vm.expectRevert("The campaign is already closed");
//         campaignManager.closeCampaign(campaignId);
//         vm.stopPrank();
//     }
    
//     function testSuccessfulCampaign() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Fund it fully
//         vm.startPrank(donor1);
//         campaignManager.donate{value: FUNDING_GOAL}(campaignId);
//         vm.stopPrank();
        
//         // Close the campaign
//         vm.startPrank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Check campaign is successful
//         (,,,,,,, bool isClosed, bool isSuccessful) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(isClosed, true, "Campaign should be closed");
//         assertEq(isSuccessful, true, "Campaign should be successful");
//         vm.stopPrank();
//     }
    
//     function testWithdrawFunds() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Fund it fully
//         vm.startPrank(donor1);
//         campaignManager.donate{value: FUNDING_GOAL}(campaignId);
//         vm.stopPrank();
        
//         // Close the campaign
//         vm.startPrank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Record creator's balance before withdrawal
//         uint256 creatorBalanceBefore = creator.balance;
        
//         vm.expectEmit(true, true, false, true);
//         emit FundsWithdrawn(campaignId, creator, FUNDING_GOAL);
        
//         // Withdraw funds
//         campaignManager.withdrawFunds(campaignId);
        
//         // Check funds were transferred to creator
//         assertEq(creator.balance, creatorBalanceBefore + FUNDING_GOAL, "Creator should receive the funds");
        
//         // Check campaign funds are now zero
//         (,,,,,, uint256 amountRaised,,) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(amountRaised, 0, "Campaign funds should be zero after withdrawal");
        
//         vm.stopPrank();
//     }
    
//     function testWithdrawFromNonSuccessfulCampaign() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
        
//         // Donate less than goal
//         vm.stopPrank();
//         vm.startPrank(donor1);
//         campaignManager.donate{value: FUNDING_GOAL / 2}(campaignId);
//         vm.stopPrank();
        
//         // Close the campaign
//         vm.startPrank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Try to withdraw
//         vm.expectRevert("The campaign did not reach its goal");
//         campaignManager.withdrawFunds(campaignId);
//         vm.stopPrank();
//     }
    
//     function testWithdrawFromUnclosedCampaign() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
        
//         // Fund it fully but don't close it
//         vm.stopPrank();
//         vm.startPrank(donor1);
//         campaignManager.donate{value: FUNDING_GOAL}(campaignId);
//         vm.stopPrank();
        
//         // Try to withdraw
//         vm.startPrank(creator);
//         vm.expectRevert("The campaign must be closed");
//         campaignManager.withdrawFunds(campaignId);
//         vm.stopPrank();
//     }
    
//     function testWithdrawAsNonCreator() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Fund it fully
//         vm.startPrank(donor1);
//         campaignManager.donate{value: FUNDING_GOAL}(campaignId);
//         vm.stopPrank();
        
//         // Close the campaign
//         vm.startPrank(creator);
//         campaignManager.closeCampaign(campaignId);
//         vm.stopPrank();
        
//         // Try to withdraw as non-creator
//         vm.startPrank(donor1);
//         vm.expectRevert("Only the campaign creator can perform this action");
//         campaignManager.withdrawFunds(campaignId);
//         vm.stopPrank();
//     }
    
//     function testCampaignActiveStatus() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Should be active
//         assertEq(campaignManager.isCampaignActive(campaignId), true, "Campaign should be active");
        
//         // Close campaign
//         vm.startPrank(creator);
//         campaignManager.closeCampaign(campaignId);
//         vm.stopPrank();
        
//         // Should not be active
//         assertEq(campaignManager.isCampaignActive(campaignId), false, "Campaign should not be active after closing");
        
//         // Create another campaign
//         vm.startPrank(creator);
//         uint256 campaignId2 = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Advance time past deadline
//         vm.warp(block.timestamp + (DURATION * 1 days) + 1);
        
//         // Should not be active due to deadline
//         assertEq(campaignManager.isCampaignActive(campaignId2), false, "Campaign should not be active after deadline");
//     }
    
//     function testWithdrawMultipleTimes() public {
//         // Create a campaign
//         vm.startPrank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             TITLE,
//             DESCRIPTION,
//             FUNDING_GOAL,
//             DURATION
//         );
//         vm.stopPrank();
        
//         // Fund it fully
//         vm.startPrank(donor1);
//         campaignManager.donate{value: FUNDING_GOAL}(campaignId);
//         vm.stopPrank();
        
//         // Close the campaign
//         vm.startPrank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Withdraw funds
//         campaignManager.withdrawFunds(campaignId);
        
//         // Try to withdraw again
//         vm.expectRevert("No funds to withdraw");
//         campaignManager.withdrawFunds(campaignId);
//         vm.stopPrank();
//     }
// }
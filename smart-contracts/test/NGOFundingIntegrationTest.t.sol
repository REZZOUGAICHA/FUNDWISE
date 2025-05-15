// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CampaignManager.sol";
import "../src/DonationManager.sol";
import "../src/ProofStorage.sol";
import "../src/FundReleaseManager.sol";
import "../src/mocks/MockERC20.sol";
import "forge-std/console.sol";
import "forge-std/console2.sol";

contract NGOFundingIntegrationTest is Test {
    CampaignManager public campaignManager;
    DonationManager public donationManager;
    ProofStorage public proofStorage;
    FundReleaseManager public fundReleaseManager;
    MockERC20 public mockUSDT;
    
    address public owner = address(1);
    address public ngo = address(2);
    address public donor = address(3);
    address public verifier = address(4);
    
    uint256 public campaignId;
    bytes32 public proofId;
    
    // Constants for test scenario
    string constant CAMPAIGN_TITLE = "Clean Water Project";
    string constant CAMPAIGN_DESC = "Provide clean water to rural communities";
    uint256 constant FUNDING_GOAL = 10_000 * 1e6; // 10,000 USDT (6 decimals)
    uint256 constant DURATION_DAYS = 30;
    uint256 constant DONATION_AMOUNT = 6_000 * 1e6; // 6,000 USDT
    uint256 constant MIN_DONATION = 10 * 1e6; // 10 USDT
    uint256 constant FIRST_RELEASE_AMOUNT = 3_000 * 1e6; // 3,000 USDT
    uint256 constant SECOND_RELEASE_AMOUNT = 3_000 * 1e6; // 3,000 USDT
    
    function setUp() public {
        // Set up the test with owner
        vm.startPrank(owner);
        

        
        // Deploy mock USDT token with 6 decimals
        mockUSDT = new MockERC20("USDT", "USDT", 6);
        
        // Deploy contracts
        campaignManager = new CampaignManager();
        proofStorage = new ProofStorage();
        donationManager = new DonationManager(
            address(mockUSDT),
            address(campaignManager),
            MIN_DONATION
        );
        fundReleaseManager = new FundReleaseManager(
            address(campaignManager),
            address(donationManager),
            address(proofStorage),
            address(mockUSDT)
        );
        proofStorage.addValidator(address(fundReleaseManager));
        
        // Set up permissions
        // Add verifier to CampaignManager
        campaignManager.addVerifier(verifier);
        
        // Add validators to ProofStorage 
        proofStorage.addValidator(verifier);
        console2.log("Is verifier a validator in ProofStorage?", proofStorage.validators(verifier));

        // Link DonationManager with FundReleaseManager
        donationManager.approveFundReleaseManager(address(fundReleaseManager));
        
        // Mint tokens to donor
        mockUSDT.mint(donor, DONATION_AMOUNT);
        
        vm.stopPrank();
    }
    
    function testFullNGOFundingFlow() public {
        // Step 1: NGO creates a campaign
        vm.startPrank(ngo);
        campaignId = campaignManager.createCampaign(
            CAMPAIGN_TITLE,
            CAMPAIGN_DESC,
            FUNDING_GOAL,
            DURATION_DAYS
        );
        vm.stopPrank();
        
        // Step 2: Verifier verifies and activates the campaign
        vm.startPrank(verifier);
        campaignManager.verifyCampaign(campaignId);
        campaignManager.activateCampaign(campaignId);
        vm.stopPrank();
        
        // Check campaign is active
        assertTrue(campaignManager.isCampaignActive(campaignId), "Campaign should be active");
        
        // Step 3: Donor approves and donates to the campaign
        vm.startPrank(donor);
        mockUSDT.approve(address(donationManager), DONATION_AMOUNT);
        donationManager.donate(campaignId, DONATION_AMOUNT);
        vm.stopPrank();
        
        // Check donation was recorded
        assertEq(donationManager.getCampaignDonationTotal(campaignId), DONATION_AMOUNT, "Donation amount should be recorded correctly");
        
        // Step 4: NGO submits proof for first 50% release
        string memory ipfsHash1 = "QmHash1";
        string memory proofDesc1 = "Initial implementation plan with budget breakdown";
        
        vm.startPrank(ngo);
        proofId = proofStorage.submitProof(
            campaignId,
            ipfsHash1,
            proofDesc1,
            FIRST_RELEASE_AMOUNT
        );
        vm.stopPrank();
        
        // Print proof details for debugging
        emit log_bytes32(proofId);
        assertEq(proofStorage.getProofAmount(proofId), FIRST_RELEASE_AMOUNT, "Proof amount should match");
        
        // Print proof status for debugging
        vm.prank(address(0));
        uint8 proofStatus = proofStorage.getProofStatus(proofId);
        console2.log("Proof status:", proofStatus);
        
        vm.prank(address(0));
        uint8 submittedStatus = proofStorage.PROOF_STATUS_SUBMITTED();
        console2.log("PROOF_STATUS_SUBMITTED value:", submittedStatus);
        
        // Step 5: Verifier approves proof and releases first 50% of funds
        // Note: Now we can call this from any address since validator checks are removed
        vm.startPrank(verifier);
        fundReleaseManager.approveProofAndReleaseFunds(proofId);
        vm.stopPrank();
        
        // Check funds were released
        assertEq(fundReleaseManager.getTotalReleasedFunds(campaignId), FIRST_RELEASE_AMOUNT, "First release amount should be recorded");
        assertEq(mockUSDT.balanceOf(ngo), FIRST_RELEASE_AMOUNT, "NGO should receive first release amount");
        
        // Step 6: NGO submits proof for remaining funds
        string memory ipfsHash2 = "QmHash2";
        string memory proofDesc2 = "Progress report and plan for remaining funds";
        
        vm.startPrank(ngo);
        bytes32 proofId2 = proofStorage.submitProof(
            campaignId,
            ipfsHash2,
            proofDesc2,
            SECOND_RELEASE_AMOUNT
        );
        vm.stopPrank();
        
        // Step 7: Validator approves proof and releases remaining funds
        vm.startPrank(verifier);
        fundReleaseManager.approveProofAndReleaseFunds(proofId2);
        vm.stopPrank();
        
        // Check all funds were released
        assertEq(fundReleaseManager.getTotalReleasedFunds(campaignId), DONATION_AMOUNT, "All funds should be released");
        assertEq(mockUSDT.balanceOf(ngo), DONATION_AMOUNT, "NGO should receive all funds");
        
        // Step 8: NGO submits final proof
        string memory ipfsHash3 = "QmHash3";
        string memory proofDesc3 = "Final report with outcomes and impact";
        
        vm.startPrank(ngo);
        proofStorage.submitProof(
            campaignId,
            ipfsHash3,
            proofDesc3,
            0 // No funds requested, just reporting
        );
        vm.stopPrank();
        
        // Test complete - the full flow has been executed successfully
    }
    function testAdvancedFundingFlowsAndFailures() public {
    vm.startPrank(owner);

    // Set up campaign
    campaignId = campaignManager.createCampaign(
        CAMPAIGN_TITLE,
        CAMPAIGN_DESC,
        FUNDING_GOAL,
        DURATION_DAYS
    );
    vm.stopPrank();

    // Try to donate before campaign is verified/active
    vm.startPrank(donor);
    mockUSDT.approve(address(donationManager), DONATION_AMOUNT);
    vm.expectRevert(); // Should fail because campaign is not active
    donationManager.donate(campaignId, DONATION_AMOUNT);
    vm.stopPrank();

    // Verify & activate
    vm.startPrank(verifier);
    campaignManager.verifyCampaign(campaignId);
    campaignManager.activateCampaign(campaignId);
    vm.stopPrank();

    // Donate
    vm.startPrank(donor);
    donationManager.donate(campaignId, DONATION_AMOUNT);
    vm.stopPrank();

    // === CASE 1: First proof asks for more than 50% => should fail ===
vm.startPrank(ngo);
bytes32 failProofId = proofStorage.submitProof(
    campaignId,
    "QmTooMuch",
    "Asking too much too early",
    (DONATION_AMOUNT / 2) + 1
);
vm.stopPrank();

vm.startPrank(verifier);
vm.expectRevert("First release cannot exceed 50% of donations");
fundReleaseManager.approveProofAndReleaseFunds(failProofId);
vm.stopPrank();


    // === CASE 2: Submit 2 proofs before approval of first one ===
    vm.startPrank(ngo);
    proofId = proofStorage.submitProof(
        campaignId,
        "QmValid1",
        "Legit proof 1",
        FIRST_RELEASE_AMOUNT
    );
    bytes32 extraProofId = proofStorage.submitProof(
        campaignId,
        "QmValid2",
        "Premature second proof",
        SECOND_RELEASE_AMOUNT
    );
    vm.stopPrank();

    // Only the first should be processable now
    vm.startPrank(verifier);
    fundReleaseManager.approveProofAndReleaseFunds(proofId);
    // The second one still works because logic allows it (unless you want to block until first is used)
    fundReleaseManager.approveProofAndReleaseFunds(extraProofId);
    vm.stopPrank();

    // === CASE 3: Try to process same proof twice ===
    vm.startPrank(verifier);
    vm.expectRevert("Proof not in submitted status");
    fundReleaseManager.approveProofAndReleaseFunds(proofId);
    vm.stopPrank();

    // === CASE 4: Reject a proof ===
    vm.startPrank(ngo);
    bytes32 rejectableProof = proofStorage.submitProof(
        campaignId,
        "QmReject",
        "Invalid report",
        1_000
    );
    vm.stopPrank();

    vm.startPrank(verifier);
    fundReleaseManager.rejectProof(rejectableProof, "Missing receipts");
    vm.expectRevert("Proof not in submitted status");
fundReleaseManager.rejectProof(rejectableProof, "Double rejection attempt");
    vm.stopPrank();

    // === CASE 5: Submit proof for more funds than remaining ===
    uint256 totalReleased = fundReleaseManager.getTotalReleasedFunds(campaignId);
    uint256 remaining = DONATION_AMOUNT - totalReleased;

    vm.startPrank(ngo);
    bytes32 overdrawProof = proofStorage.submitProof(
        campaignId,
        "QmOverdraw",
        "Trying to withdraw too much",
        remaining + 1
    );
    vm.stopPrank();

    vm.startPrank(verifier);
    vm.expectRevert("Insufficient available funds");
    fundReleaseManager.approveProofAndReleaseFunds(overdrawProof);
    vm.stopPrank();

    // === CASE 6: Try to approve non-existent proof ===
    vm.startPrank(verifier);
    vm.expectRevert("Proof does not exist");
    fundReleaseManager.approveProofAndReleaseFunds(keccak256("does_not_exist"));
    vm.stopPrank();

    // === CASE 7: Final 0-amount proof (should work if allowed) ===
    vm.startPrank(ngo);
    vm.stopPrank();

    // This proof can be ignored or processed based on business logic — you may skip calling approve.
}

}
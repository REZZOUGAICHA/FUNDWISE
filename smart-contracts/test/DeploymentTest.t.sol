// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/mocks/MockERC20.sol";
import "../src/CampaignManager.sol";
import "../src/ProofStorage.sol";
import "../src/DonationManager.sol";
import "../src/FundReleaseManager.sol";

contract DeploymentTest is Test {
    MockERC20 mockUSDT;
    CampaignManager campaignManager;
    ProofStorage proofStorage;
    DonationManager donationManager;
    FundReleaseManager fundReleaseManager;

    function setUp() public {
        // Deploy all contracts (same as in your script)
        mockUSDT = new MockERC20("USDT", "USDT", 6);
        campaignManager = new CampaignManager();
        proofStorage = new ProofStorage();
        donationManager = new DonationManager(
            address(mockUSDT),
            address(campaignManager),
            10 * 1e6
        );
        fundReleaseManager = new FundReleaseManager(
            address(campaignManager),
            address(donationManager),
            address(proofStorage),
            address(mockUSDT)
        );

        // Assign fundReleaseManager as validator
        proofStorage.addValidator(address(fundReleaseManager));
    }

    function testDeploymentAddressesAreNotZero() public {
        assert(address(mockUSDT) != address(0));
        assert(address(campaignManager) != address(0));
        assert(address(proofStorage) != address(0));
        assert(address(donationManager) != address(0));
        assert(address(fundReleaseManager) != address(0));
    }

    function testDonationManagerSetup() public {
        assertEq(donationManager.token(), address(mockUSDT));
        assertEq(donationManager.campaignManager(), address(campaignManager));
        assertEq(donationManager.minDonation(), 10 * 1e6);
    }

    function testFundReleaseManagerSetup() public {
        assertEq(fundReleaseManager.campaignManager(), address(campaignManager));
        assertEq(fundReleaseManager.donationManager(), address(donationManager));
        assertEq(fundReleaseManager.proofStorage(), address(proofStorage));
        assertEq(fundReleaseManager.token(), address(mockUSDT));
    }

    function testValidatorRoleSet() public {
        assertTrue(proofStorage.validators(address(fundReleaseManager)));
    }
}

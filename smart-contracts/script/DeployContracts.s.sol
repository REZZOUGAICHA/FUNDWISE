// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/mocks/MockERC20.sol";
import "../src/CampaignManager.sol";
import "../src/ProofStorage.sol";
import "../src/DonationManager.sol";
import "../src/FundReleaseManager.sol";

contract DeployFundWise is Script {
    function run() public {
        vm.startBroadcast();

        MockERC20 mockUSDT = new MockERC20("USDT", "USDT", 6);
        CampaignManager campaignManager = new CampaignManager();
        ProofStorage proofStorage = new ProofStorage();
        DonationManager donationManager = new DonationManager(
            address(mockUSDT),
            address(campaignManager),
            10 * 1e6 // min donation
        );
        FundReleaseManager fundReleaseManager = new FundReleaseManager(
            address(campaignManager),
            address(donationManager),
            address(proofStorage),
            address(mockUSDT)
        );

        // Add validator roles if needed
        proofStorage.addValidator(address(fundReleaseManager));

        vm.stopBroadcast();

        // Print deployed addresses for backend config
        console.log("MockUSDT deployed at:", address(mockUSDT));
        console.log("CampaignManager deployed at:", address(campaignManager));
        console.log("ProofStorage deployed at:", address(proofStorage));
        console.log("DonationManager deployed at:", address(donationManager));
        console.log("FundReleaseManager deployed at:", address(fundReleaseManager));
    }
}

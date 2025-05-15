// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "forge-std/Test.sol";
// import "../src/CampaignManager.sol";

// contract CampaignManagerTest is Test {
//     CampaignManager public campaignManager;
//     address creator = address(1);
//     address donor1 = address(2);
//     address donor2 = address(3);

//     function setUp() public {
//         campaignManager = new CampaignManager();
//     }

//     function testCreateCampaign() public {
//         vm.prank(creator); // Simule l'appel depuis l'adresse creator
//         uint256 campaignId = campaignManager.createCampaign(
//             "Test Campaign",
//             "Description for test campaign",
//             1 ether,
//             30
//         );

//         assertEq(campaignId, 1, "The first campaign should have ID 1");
        
//         (
//             uint256 id,
//             address campaignCreator,
//             string memory title,
//             string memory description,
//             uint256 fundingGoal,
//             uint256 deadline,
//             uint256 amountRaised,
//             bool isClosed,
//             bool isSuccessful
//         ) = campaignManager.getCampaign(campaignId);
        
//         assertEq(id, campaignId);
//         assertEq(campaignCreator, creator);
//         assertEq(title, "Test Campaign");
//         assertEq(fundingGoal, 1 ether);
//         assertEq(amountRaised, 0);
//         assertEq(isClosed, false);
//         assertEq(isSuccessful, false);
//     }

//     function testDonate() public {
//         vm.prank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             "Donation Test Campaign",
//             "Description for donation test",
//             1 ether,
//             30
//         );
        
//         vm.deal(donor1, 1 ether); // Donne 1 ETH à donor1
//         vm.prank(donor1);
//         campaignManager.donate{value: 0.5 ether}(campaignId);
        
//         (,,,,,,uint256 amountRaised,,) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(amountRaised, 0.5 ether);

//         // Vérifier que le donateur est enregistré
//         address[] memory donators = campaignManager.getCampaignDonators(campaignId);
//         assertEq(donators.length, 1);
//         assertEq(donators[0], donor1);
//     }

//     function testTrackingMultipleDonations() public {
//         // Créer une campagne
//         vm.prank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             "Tracking Test Campaign",
//             "Description for tracking test",
//             1 ether,
//             30
//         );
        
//         // Faire plusieurs dons
//         vm.deal(donor1, 1 ether);
//         vm.prank(donor1);
//         campaignManager.donate{value: 0.3 ether}(campaignId);
        
//         vm.deal(donor2, 1 ether);
//         vm.prank(donor2);
//         campaignManager.donate{value: 0.4 ether}(campaignId);
        
//         // Faire un second don du même donateur
//         vm.prank(donor1);
//         campaignManager.donate{value: 0.2 ether}(campaignId);
        
//         // Vérifier le montant total collecté
//         (,,,,,,uint256 amountRaised,,) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(amountRaised, 0.9 ether);
        
//         // Vérifier le nombre de donateurs (devrait être 2, pas 3)
//         address[] memory donators = campaignManager.getCampaignDonators(campaignId);
//         assertEq(donators.length, 2);
//     }

//     function testCampaignStatus() public {
//         // Créer une campagne
//         vm.prank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             "Status Test Campaign",
//             "Description for status test",
//             1 ether,
//             30
//         );
        
//         // Vérifier que la campagne est active initialement
//         bool isActive = campaignManager.isCampaignActive(campaignId);
//         assertTrue(isActive);
        
//         // Fermer la campagne
//         vm.prank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Vérifier que la campagne n'est plus active
//         isActive = campaignManager.isCampaignActive(campaignId);
//         assertFalse(isActive);
        
//         // Vérifier le statut fermé
//         (,,,,,, ,bool isClosed, bool isSuccessful) = campaignManager.getCampaignDetails(campaignId);
//         assertTrue(isClosed);
//         assertFalse(isSuccessful);
//     }

//     function testCampaignSuccessStatus() public {
//         // Créer une campagne
//         vm.prank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             "Success Test Campaign",
//             "Description for success test",
//             1 ether,
//             30
//         );
        
//         // Faire un don qui atteint l'objectif
//         vm.deal(donor1, 2 ether);
//         vm.prank(donor1);
//         campaignManager.donate{value: 1 ether}(campaignId);
        
//         // Fermer la campagne
//         vm.prank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Vérifier que la campagne est marquée comme réussie
//         (,,,,,, ,bool isClosed, bool isSuccessful) = campaignManager.getCampaignDetails(campaignId);
//         assertTrue(isClosed);
//         assertTrue(isSuccessful);
//     }

//     function testDeadlineEffect() public {
//         // Créer une campagne
//         vm.prank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             "Deadline Test Campaign",
//             "Description for deadline test",
//             1 ether,
//             30 // 30 jours
//         );
        
//         // Avancer le temps de 31 jours (après la deadline)
//         vm.warp(block.timestamp + 31 days);
        
//         // Vérifier que la campagne n'est plus active à cause de la deadline
//         bool isActive = campaignManager.isCampaignActive(campaignId);
//         assertFalse(isActive);
        
//         // N'importe qui peut fermer la campagne après la deadline
//         vm.prank(donor1);
//         campaignManager.closeCampaign(campaignId);
        
//         // Vérifier que la campagne est fermée
//         (,,,,,, ,bool isClosed, bool isSuccessful) = campaignManager.getCampaignDetails(campaignId);
//         assertTrue(isClosed);
//         assertFalse(isSuccessful);
//     }

//     function testWithdrawFunds() public {
//         // Créer une campagne
//         vm.prank(creator);
//         uint256 campaignId = campaignManager.createCampaign(
//             "Withdraw Test Campaign",
//             "Description for withdraw test",
//             1 ether,
//             30
//         );
        
//         // Faire un don qui atteint l'objectif
//         vm.deal(donor1, 2 ether);
//         vm.prank(donor1);
//         campaignManager.donate{value: 1 ether}(campaignId);
        
//         // Fermer la campagne
//         vm.prank(creator);
//         campaignManager.closeCampaign(campaignId);
        
//         // Noter le solde initial du créateur
//         uint256 initialBalance = creator.balance;
        
//         // Retirer les fonds
//         vm.prank(creator);
//         campaignManager.withdrawFunds(campaignId);
        
//         // Vérifier que les fonds ont été transférés au créateur
//         assertEq(creator.balance - initialBalance, 1 ether);
        
//         // Vérifier que le montant collecté est remis à zéro
//         (,,,,,,uint256 amountRaised,,) = campaignManager.getCampaignDetails(campaignId);
//         assertEq(amountRaised, 0);
//     }
// }

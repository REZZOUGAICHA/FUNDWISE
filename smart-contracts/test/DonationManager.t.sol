// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DonationManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUSDT is IERC20 {
    string public name = "MockUSDT";
    string public symbol = "mUSDT";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1_000_000 * 10**18;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Not enough balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        return true;
    }
}

contract DonationManagerTest is Test {
    DonationManager public donationManager;
    MockUSDT public mockUSDT;
    address public donor = address(1);

    function setUp() public {
        mockUSDT = new MockUSDT();
        donationManager = new DonationManager(address(mockUSDT));

        // Fund the donor with USDT and approve DonationManager
        mockUSDT.transfer(donor, 1000 * 10**18);
        vm.prank(donor);
        mockUSDT.approve(address(donationManager), 1000 * 10**18);
    }

    function testDonate() public {
        vm.prank(donor);
        donationManager.donate(100 * 10**18);

        assertEq(donationManager.donations(donor), 100 * 10**18);
        assertEq(donationManager.getTotalDonations(), 100 * 10**18);
    }

    function test_Revert_When_DonatingZero() public {
    vm.prank(donor);
    vm.expectRevert("Donation must be greater than zero");
    donationManager.donate(0);
}

}

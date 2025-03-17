// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DonationManager {
    IERC20 public usdt;
    address public owner;

    mapping(address => uint256) public donations;
    event DonationReceived(address indexed donor, uint256 amount);

    constructor(address _usdtAddress) {
        owner = msg.sender;
        usdt = IERC20(_usdtAddress);
    }

    function donate(uint256 amount) public {
        require(amount > 0, "Donation must be greater than zero");
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        donations[msg.sender] += amount;
        emit DonationReceived(msg.sender, amount);
    }

    function getTotalDonations() public view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
}

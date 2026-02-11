// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Exchange is Ownable {
    IERC20 public immutable ydToken;
    uint256 public rate; // YD per 1 ETH (both 18 decimals)
    address public feeRecipient;
    uint256 public feeBps;

    event SwappedEthToYd(address indexed user, uint256 ethIn, uint256 ydOut, uint256 fee);
    event SwappedYdToEth(address indexed user, uint256 ydIn, uint256 ethOut, uint256 fee);
    event RateUpdated(uint256 newRate);
    event FeeRecipientUpdated(address newRecipient);
    event FeeBpsUpdated(uint256 newFeeBps);
    event WithdrawEth(address indexed to, uint256 amount);
    event WithdrawYd(address indexed to, uint256 amount);

    constructor(
        address tokenAddress,
        uint256 rate_,
        address feeRecipient_,
        uint256 feeBps_,
        address owner
    ) Ownable(owner) {
        require(tokenAddress != address(0), "Exchange: token is zero");
        require(feeRecipient_ != address(0), "Exchange: fee recipient is zero");
        ydToken = IERC20(tokenAddress);
        rate = rate_;
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    receive() external payable {}

    function setRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Exchange: rate is zero");
        rate = newRate;
        emit RateUpdated(newRate);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Exchange: fee recipient is zero");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Exchange: fee too high");
        feeBps = newFeeBps;
        emit FeeBpsUpdated(newFeeBps);
    }

    function swapEthToYd() external payable {
        require(msg.value > 0, "Exchange: zero ETH");
        uint256 ydAmount = msg.value * rate;
        uint256 fee = (ydAmount * feeBps) / 10_000;
        uint256 net = ydAmount - fee;
        require(ydToken.balanceOf(address(this)) >= ydAmount, "Exchange: insufficient YD");
        require(ydToken.transfer(msg.sender, net), "Exchange: transfer failed");
        if (fee > 0) {
            require(ydToken.transfer(feeRecipient, fee), "Exchange: fee transfer failed");
        }
        emit SwappedEthToYd(msg.sender, msg.value, net, fee);
    }

    function swapYdToEth(uint256 ydAmount) external {
        require(ydAmount > 0, "Exchange: zero YD");
        uint256 fee = (ydAmount * feeBps) / 10_000;
        uint256 netYd = ydAmount - fee;
        uint256 ethOut = netYd / rate;
        require(ethOut > 0, "Exchange: zero ETH out");
        require(address(this).balance >= ethOut, "Exchange: insufficient ETH");
        require(ydToken.transferFrom(msg.sender, address(this), ydAmount), "Exchange: transferFrom failed");
        if (fee > 0) {
            require(ydToken.transfer(feeRecipient, fee), "Exchange: fee transfer failed");
        }
        (bool ok,) = payable(msg.sender).call{value: ethOut}("");
        require(ok, "Exchange: ETH transfer failed");
        emit SwappedYdToEth(msg.sender, ydAmount, ethOut, fee);
    }

    function withdrawEth(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "Exchange: to is zero");
        require(address(this).balance >= amount, "Exchange: insufficient ETH");
        (bool ok,) = to.call{value: amount}("");
        require(ok, "Exchange: ETH transfer failed");
        emit WithdrawEth(to, amount);
    }

    function withdrawYd(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Exchange: to is zero");
        require(ydToken.balanceOf(address(this)) >= amount, "Exchange: insufficient YD");
        require(ydToken.transfer(to, amount), "Exchange: transfer failed");
        emit WithdrawYd(to, amount);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IWhitelist {
    function whitelistedAddresses(address addr_) external view returns(bool);
}
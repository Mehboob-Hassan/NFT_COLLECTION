// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    bool public _paused;
    bool public presaleStarted;
    uint public presaleEnded;
    uint public mintPrice = 0.0001 ether;
    uint public tokenIds;
    uint public maxTokenIds = 20;

    // Declare instance of Whitelist contract
    IWhitelist whitelisted;

    constructor(address whitelistAdress, string memory baseTokenURI) ERC721("Crypto Dev", "Dev"){
        _baseTokenURI = baseTokenURI;
        whitelisted = IWhitelist(whitelistAdress);
    }

    // Set paused
    modifier onlyWhenNotPaused(){
        require(!_paused, "Contract currently paused");
        _;
    } 



    // start minting if interval is started (for Whitelisted)
    function parsaleMint() payable onlyWhenNotPaused public {
        require(presaleStarted && block.timestamp < presaleEnded, "Parsel is Ended");
        require(whitelisted.whitelistedAddresses(msg.sender), "You are not whitelisted");
        require(tokenIds < maxTokenIds, "Limit Reached");
        require(msg.value >= mintPrice, "Value not sufficient");
        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);
    }

    // start public minting if interval Ender
    function mint() payable onlyWhenNotPaused public {
        require(presaleStarted && block.timestamp >= presaleEnded, "Parsel is not Ended");
        require(tokenIds < maxTokenIds, "Limit Reached");
        require(msg.value >= mintPrice, "Value not sufficient");
        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);
    }

    // Override BaseURI from ERC721
    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI;
    }


    // Set Interval
    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    // Set Paused
    function setPaused(bool _boo) public onlyOwner {
        _paused = _boo;
    }

    // Withdraw ethers to own Account
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Ether not sent");
    }

    // Receive value/Data
    receive() external payable {}
    fallback() external payable {}
}

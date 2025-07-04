// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

struct NftInfo {
    uint256 tokenId;
    uint256 resourceId;
}

contract TetrisNFT is 
    Initializable,
    ERC721URIStorageUpgradeable, 
    OwnableUpgradeable,
    UUPSUpgradeable 
{
    using Strings for uint256;
    error AlreadyMinted();
    error NonexistentToken();
    error ResourceIdOutOfRange(uint256 resourceId);

    uint256 private _tokenIdCounter;
    string public baseURI;
    mapping(uint256 => uint256) public tokenId2ResourceId;
    mapping(address => NftInfo) public hasMinted;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC721_init("Tetris PvP Access", "TETRIS");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        baseURI = "https://tetris-battle.netlify.app/nfts/";
    }

    function mint(uint256 resourceId) external payable {
        if (hasMinted[msg.sender].tokenId != 0) {
            revert AlreadyMinted();
        }

        if (resourceId == 0 || resourceId > 4) {
            revert ResourceIdOutOfRange(resourceId);
        }

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _setTokenURI(tokenId, string(abi.encodePacked(baseURI, resourceId)));
        
        tokenId2ResourceId[tokenId] = resourceId;
        hasMinted[msg.sender] = NftInfo(tokenId, resourceId);
        _safeMint(msg.sender, tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    // Required by the UUPS proxy
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint256 resourceId = tokenId2ResourceId[tokenId];
        return string.concat(baseURI, resourceId.toString());
    }
}

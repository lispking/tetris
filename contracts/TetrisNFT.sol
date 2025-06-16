// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract TetrisNFT is 
    Initializable,
    ERC721Upgradeable, 
    OwnableUpgradeable,
    UUPSUpgradeable 
{
    error AlreadyMinted();
    error NonexistentToken();
    error TokenIdOutOfRange(uint256 tokenId);

    uint256 private _tokenIdCounter;
    string public baseURI;
    mapping(address => bool) public hasMinted;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC721_init("Tetris PvP Access", "TETRIS");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        baseURI = "https://multi-tetris.vercel.app/nfts/";
    }

    function safeMint(address to, uint256 tokenId) external onlyOwner {
        if (tokenId == 0 || tokenId > 4) {
            revert TokenIdOutOfRange(tokenId);
        }
        _safeMint(to, tokenId);
        _tokenIdCounter++;
    }

    function mint(uint256 tokenId) external {
        if (hasMinted[msg.sender]) {
            revert AlreadyMinted();
        }

        if (tokenId == 0 || tokenId > 4) {
            revert TokenIdOutOfRange(tokenId);
        }

        _tokenIdCounter++;
        
        hasMinted[msg.sender] = true;
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

    // The following functions are overrides required by Solidity
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert NonexistentToken();
        }
        return string(abi.encodePacked(baseURI, tokenId));
    }
}

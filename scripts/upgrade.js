const { ethers, upgrades } = require("hardhat");

async function main() {
  // Replace this address with your deployed proxy address
  const proxyAddress = "YOUR_PROXY_ADDRESS";
  
  console.log(`Upgrading TetrisNFT at ${proxyAddress}...`);
  
  // Get the contract factory for the new implementation
  const TetrisNFT = await ethers.getContractFactory("TetrisNFT");
  
  // Upgrade the proxy to use the new implementation
  const tetrisNFT = await upgrades.upgradeProxy(proxyAddress, TetrisNFT, {
    kind: "uups"
  });
  
  console.log("TetrisNFT upgraded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

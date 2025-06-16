const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying TetrisNFT...");
  
  // Get the contract factory
  const TetrisNFT = await ethers.getContractFactory("TetrisNFT");
  
  // Deploy the proxy contract
  const tetrisNFT = await upgrades.deployProxy(TetrisNFT, [], {
    initializer: "initialize",
    kind: "uups"
  });
  
  // Wait for the deployment to complete
  await tetrisNFT.waitForDeployment();
  
  console.log("TetrisNFT deployed to:", await tetrisNFT.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

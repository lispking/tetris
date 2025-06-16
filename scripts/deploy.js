const hre = require("hardhat");

async function main() {
  const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
  const tetrisNFT = await TetrisNFT.deploy();
  
  await tetrisNFT.deployed();

  console.log(`TetrisNFT deployed to: ${tetrisNFT.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

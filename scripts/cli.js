const { task } = require("hardhat/config");
const { deployAndUpdateConfig, upgradeAndUpdateConfig } = require("./deployUtils");

const contractAddress = require('../src/contracts/TetrisNFT.json').address.monadTestnet;

task("deploy", "Deploy TetrisNFT")
  .setAction(async (taskArgs, hre) => {
    await deployAndUpdateConfig(hre, "TetrisNFT");
  });

task("upgrade", "Upgrade TetrisNFT")
  .setAction(async (taskArgs, hre) => {
    await upgradeAndUpdateConfig(hre, "TetrisNFT", contractAddress);
  });

task("setBaseURI", "Set Base URI")
  .setAction(async (taskArgs, hre) => {
    console.log("Contract Address:", contractAddress);
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contract = await TetrisNFT.attach(contractAddress);
    await contract.setBaseURI("https://tetris-battle.netlify.app/nfts/");
    console.log("Base URI set successfully");
  })

task("checkBaseURI", "Check Base URI")
  .setAction(async (taskArgs, hre) => {
    console.log("Contract Address:", contractAddress);
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contract = await TetrisNFT.attach(contractAddress);
    const baseURI = await contract.baseURI();
    console.log("Contract Base URI:", baseURI);
  });

task("tokenURI", "Get Token URI")
  .addParam("tokenId", "Token ID")
  .setAction(async (taskArgs, hre) => {
    console.log("Contract Address:", contractAddress);
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contract = await TetrisNFT.attach(contractAddress);

    const resourceId = await contract.tokenId2ResourceId(taskArgs.tokenId);
    const tokenURI = await contract.tokenURI(taskArgs.tokenId);

    console.log("Token URI:", tokenURI);
    console.log("Token Resource ID:", resourceId);
  });

const { task } = require("hardhat/config");
const { deployAndUpdateConfig, upgradeAndUpdateConfig } = require("./deployUtils");

const contractAddress = "0x11d7824F9dca07bbBcaC5eBC9Edc6818Da00140d";

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
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contract = await TetrisNFT.attach(contractAddress);
    await contract.setBaseURI("https://tetris-battle.netlify.app/nfts/");
    console.log("Base URI set successfully");
  })

task("checkBaseURI", "Check Base URI")
  .setAction(async (taskArgs, hre) => {
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contract = await TetrisNFT.attach(contractAddress);
    const baseURI = await contract.baseURI();
    console.log("Contract Base URI:", baseURI);
  });

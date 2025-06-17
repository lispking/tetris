const { task } = require("hardhat/config");
const { deployAndUpdateConfig, upgradeAndUpdateConfig } = require("./deployUtils");

task("deploy", "Deploy TetrisNFT")
  .setAction(async (taskArgs, hre) => {
    await deployAndUpdateConfig(hre, "TetrisNFT");
  });

task("upgrade", "Upgrade TetrisNFT")
  .setAction(async (taskArgs, hre) => {
    await upgradeAndUpdateConfig(hre, "TetrisNFT", "");
  });

task("setBaseURI", "Set Base URI")
  .setAction(async (taskArgs, hre) => {
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contractAddress = "0xB9a76beEA2A161C3C22EFa2247977E17bB2F8D2f";
    const contract = await TetrisNFT.attach(contractAddress);
    await contract.setBaseURI("https://tetris-battle.netlify.app/nfts/");
    console.log("Base URI set successfully");
  })

task("checkBaseURI", "Check Base URI")
  .setAction(async (taskArgs, hre) => {
    const TetrisNFT = await hre.ethers.getContractFactory("TetrisNFT");
    const contractAddress = "0xB9a76beEA2A161C3C22EFa2247977E17bB2F8D2f";
    const contract = await TetrisNFT.attach(contractAddress);
    const baseURI = await contract.baseURI();
    console.log("Contract Base URI:", baseURI);
  });

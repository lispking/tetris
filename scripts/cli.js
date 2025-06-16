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

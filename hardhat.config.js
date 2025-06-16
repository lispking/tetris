import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";

// load .env config
const dotenvConfig = require('dotenv').config;
const { resolve } = require('path');

dotenvConfig({ path: resolve(__dirname, './.env') });

const { PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    monadTestnet: {
      url: "https://monad-testnet.g.alchemy.com/v2/qFKckE9UPoFOSQpPoXzXbjKYf3OeYMUH",
      chainId: 10143,
      accounts: [`${PRIVATE_KEY}`],
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH"
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: true,
    runOnCompile: true,
    strict: true
  }
};

export default config;

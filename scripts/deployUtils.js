const fs = require("fs");
const path = require("path");

async function deployContract(hre, contractName) {
  const Contract = await hre.ethers.getContractFactory(contractName);
  console.log(`>>> Deploying ${contractName} contract...`);
  const contract = await hre.upgrades.deployProxy(Contract, [], { kind: 'uups' });
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`>>> ${contractName} deployed to:`, contractAddress);
  return contractAddress;
}

async function upgradeContract(hre, contractName, contractAddress) {
  const Contract = await hre.ethers.getContractFactory(contractName);
  console.log(`>>> Upgrading ${contractName} contract ${contractAddress}...`);
  const contract = await hre.upgrades.upgradeProxy(contractAddress, Contract);
  await contract.waitForDeployment();
  console.log(`>>> ${contractName} upgraded to:`, contractAddress);
  return contractAddress;
}

function updateContractConfig(
  contractsDir,
  contractName,
  contractAddress,
  contractArtifact,
  network
) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const filePath = path.join(contractsDir, `${contractName}.json`);
  let config = {
    address: {},
    abi: contractArtifact.abi,
  };

  // Read existing config if file exists
  if (fs.existsSync(filePath)) {
    const existingData = fs.readFileSync(filePath, "utf8");
    config = JSON.parse(existingData);
  }

  // Update address for specific network
  config.address[network] = contractAddress;

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

function readContractAddress(contractsDir, contractName, network) {
  const filePath = path.join(contractsDir, `${contractName}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    const config = JSON.parse(data);
    return config.address[network] || null;
  }
  return null;
}

async function deployAndUpdateConfig(hre, contractName) {
  const contractAddress = await deployContract(hre, contractName);
  const contractsDir = path.join(__dirname, "../src/contracts");
  const contractArtifact = await hre.artifacts.readArtifact(contractName);
  const network = hre.network.name;
  updateContractConfig(
    contractsDir,
    contractName,
    contractAddress,
    contractArtifact,
    network
  );
}

async function upgradeAndUpdateConfig(hre, contractName) {
  const contractsDir = path.join(__dirname, "../src/contracts");
  const network = hre.network.name;
  const contractAddress = readContractAddress(contractsDir, contractName, network);
  await upgradeContract(hre, contractName, contractAddress);
  const contractArtifact = await hre.artifacts.readArtifact(contractName);
  updateContractConfig(
    contractsDir,
    contractName,
    contractAddress,
    contractArtifact,
    network
  );
}

module.exports = {
  readContractAddress,
  deployAndUpdateConfig,
  upgradeAndUpdateConfig,
  deployContract,
  upgradeContract,
};

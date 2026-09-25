const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // The deploying wallet becomes the contract owner (the university admin)
  const smartCert = await hre.ethers.deployContract("SmartCert", [deployer.address]);
  await smartCert.waitForDeployment();

  console.log("SmartCert deployed to:", await smartCert.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
const hre = require("hardhat");

async function main() {
  const DIDZ = await hre.ethers.getContractFactory("PIRATEorNINJA_1");
  const didz = await DIDZ.deploy("DIDZ111","AAA");

  await didz.deployed();
//   await lock.deployed();

  console.log(`Digital ID System deployed to ${didz.address}`);
  process.exit(0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



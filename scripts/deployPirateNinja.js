const hre = require("hardhat");

async function main() {
  const DIDZ = await hre.ethers.getContractFactory("PirateNinja");
  const didz = await DIDZ.deploy("DIDZ","AAA111");

  await didz.deployed();
//   await lock.deployed();

  console.log(
    `Digital ID System deployed to ${didz.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const hre = require("hardhat");
const main = async () => {
  try {
    const nftContractFactory = await hre.ethers.getContractFactory(
      "ChainBattles"
    );
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();

    console.log("Contract deployed to:", nftContract.address);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
  
main();

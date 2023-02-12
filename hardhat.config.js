require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

require("dotenv").config();
// require("@nomiclabs/hardhat-waffle"); //obsolete, use @nomicfoundation/hardhat-chai-matchers
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      url: process.env.TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};

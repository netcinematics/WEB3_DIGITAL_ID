// const API_KEY = process.env.API_KEY; //goerli
const API_KEY = process.env.API_KEY; //mumbai and goerli?
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS_DIDZ = process.env.CONTRACT_ADDRESS_DIDZ;
// For Hardhat - get contract and abi.
const contract = require("../artifacts/contracts/PirateNinja.sol/PIRATEorNINJA_1.json");
//console.log("ABI", JSON.stringify(contract.abi));
// 1) Provider
// const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
const alchemyProvider = new ethers.providers.AlchemyProvider(network="maticmum", API_KEY);
// 2) Signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
// 3) Contract
// const magicNumberContract = new ethers.Contract(CONTRACT_ADDRESS_MAGICNUM, contract.abi, signer);
const DIDZContract = new ethers.Contract(CONTRACT_ADDRESS_DIDZ, contract.abi, signer);

async function main() {
    // const magicNUM = await magicNumberContract.magicNUM();
try{
    if(!DIDZContract){console.log("contract not found"); return;}
    else{console.log("contract connected")}
    const contractName = await DIDZContract.name();
    const contractSymbol = await DIDZContract.symbol();
    console.log("Name: ", contractName);
    console.log("Symbol: ", contractSymbol);
    // const tx = await magicNumberContract.updateNUM(88); //pending, mined, or dropped: goerli etherscan.
    // await tx.wait();  //if left out, local contract not be able to see the updated magicNUM value

    // const newNUM = await magicNumberContract.magicNUM();
    // console.log("The NEW NUM is: " + newNUM); 
    process.exit(0);
  } catch (error) {

    //TIMEOUT - NASTY ERROR MSG:
    // --network mumbai
    // contract connected
    // ========= NOTICE =========
    // Request-Rate Exceeded  (this message will not be repeated)
    // The default API keys for each service are provided as a highly-throttled,
    // community resource for low-traffic projects and early prototyping.
    
    // While your application will continue to function, we highly recommended
    // signing up for your own API keys to improve performance, increase your
    // request rate/limit and enable other perks, such as metrics and advanced APIs.  




    console.log(error);
    process.exit(1);
  }


  }
  main();


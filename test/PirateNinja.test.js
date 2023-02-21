const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { ethers } = require('hardhat'); //for zero address
const { expect } = require("chai");
  // https://hardhat.org/hardhat-network-helpers/docs/reference
  // https://hardhat.org/hardhat-chai-matchers/docs/overview

describe("PIRATEorNINJA_1", function () {
  async function deployPirateNinjaFixture() { //define fixture
    const timestamp = (await time.latest());
    // Contracts are deployed using the first signer/account by default
    const [owner, account2, account3 ] = await ethers.getSigners();
    console.log("OWNER:",owner.address);
    console.log("ADDRESS2:",account2.address);
    console.log('DIDz Constructor');
    const PIRATEorNINJA_1 = await ethers.getContractFactory("PIRATEorNINJA_1");
    const didz = await PIRATEorNINJA_1.deploy('DIDz','TEST111');
    return { didz, timestamp, owner, account2, account3 };
  }

describe("Deploy Contract:", function() {
  it("should return contract with NAME and SYMBOL", async function () {
    const {didz, timestamp} = await loadFixture(deployPirateNinjaFixture);
    expect(didz); //NAME and SYMBOL and BALANCE
    console.log("NAME:",await didz.name(),"SYMBOL:",await didz.symbol());
    expect(await didz.name()).to.equal('DIDz');
    expect(await didz.symbol()).to.equal('TEST111');
    const balance = await ethers.provider.getBalance(didz.address)
    console.log("BALANCE:", balance);
    expect(balance).to.equal(0); 
    console.log("TIMESTAMP:",timestamp);
  })
});

describe("MINT behaviors:", function(){
  it("Should auto MINT (2) IDz on deploy to OWNER", async function () {
    const {didz,owner,account2} = await loadFixture(deployPirateNinjaFixture);
    expect(await didz.totalSupply()).to.equal(2);
    expect(await didz.ownerOf(1)).to.equal(owner.address);
  });
  
  it("Should MINT owner (3) and address2 (4), but not addr2 twice", async function () {
    const {didz, owner, account2} = await loadFixture(deployPirateNinjaFixture);
    const safeMintPirateNinjaID = await didz.safeMintPirateNinjaID(owner.address,2);
    expect(safeMintPirateNinjaID);
    expect(await didz.totalSupply()).to.equal(3);
    expect(await didz.ownerOf(3)).to.equal(owner.address);
    expect(await didz.safeMintPirateNinjaID(account2.address,1)).to.not.be.reverted;
    expect(await didz.totalSupply()).to.equal(4);
    expect(await didz.ownerOf(4)).to.equal(account2.address);
    await expect(didz.safeMintPirateNinjaID(account2.address,2)).to.be.revertedWith(
      "one mint per wallet"); 
    await expect(didz.safeMintPirateNinjaID(account2.address,0)).to.be.revertedWith(
      "bad data");
    // await expect(didz.safeMintPirateNinjaID(ethers.constants.ZeroAddress,1)).to.be.revertedWith(
    await expect(didz.safeMintPirateNinjaID("0x0000000000000000000000000000000000000000",1)).to.be.revertedWith(
      "bad address");
    expect(await didz.totalSupply()).to.equal(4);    
  });

  it("Should revert MAX-MINT:", async function () {
    //New fixture, for a different deployment.
    const PIRATEorNINJA_1 = await ethers.getContractFactory("PIRATEorNINJA_1");
    const didz = await PIRATEorNINJA_1.deploy('DIDz','TESTMAX');
    const [owner, account2] = await ethers.getSigners();
    let maxMint = await didz.maxMintSupply();
    let startSupply = await didz.totalSupply();
    console.log("MAX-MINT-AMOUNT:", maxMint);
    console.log("START-SUPPLY:",startSupply);
    let safeMintPirateNinjaID = null; //owner is allowed to mint multiple for this test
    for (let i = 1; i <= maxMint-startSupply; i++) { //console.log(i);
        safeMintPirateNinjaID = await didz.safeMintPirateNinjaID(owner.address,2);
    }
    console.log("END-SUPPLY:",await didz.totalSupply());
    expect(await didz.safeMintPirateNinjaID(owner.address,1)).to.be.revertedWith(
      "MAX-MINT reached");
    console.log("OVER-SUPPLY-1:",await didz.totalSupply());
    await expect(didz.safeMintPirateNinjaID(account2.address,2)).to.be.revertedWith(
      "MAX-MINT reached");
    console.log("OVER-SUPPLY-2:",await didz.totalSupply());
    await expect(await didz.ownerOf(await didz.totalSupply())).to.equal(owner.address);
    const overdraft = await didz.totalSupply()+1;
    expect(didz.ownerOf(overdraft)).to.be.revertedWith("ERC721: invalid token ID");
  }); 
});

describe("NON-TRANSFERABLE", function () {
  it("Should not transfer:", async function () {
    const {didz, owner, account2} = await loadFixture(deployPirateNinjaFixture);
    await expect(didz.transferFrom(owner.address,account2.address,2)).to.be.revertedWith(
      "SBT can only be burned");
    expect(await didz.ownerOf(2)).to.equal(owner.address);
    // await didz.transferFrom(owner.address,account2.address,2); //Working Transfer
  });
});    

describe("PAUSABLE:", function () {
  it("Should be pausable by owner, not addr2, and should resume.", async function () {
    const {didz, account2} = await loadFixture(deployPirateNinjaFixture);
    expect(await didz.paused()).to.equal(false);
    await expect(didz.pause(true)).not.to.be.reverted;
    expect(await didz.paused()).to.equal(true);
    await expect(didz.safeMintPirateNinjaID(account2.address,2)).to.be.revertedWith(
      "contract is paused");
    expect(await didz.totalSupply()).to.equal(2);
    await expect(didz.connect(account2).pause(false)).to.be.revertedWith(
      "Ownable: caller is not the owner" );  
    await expect(didz.pause(false)).not.to.be.reverted;
    expect(await didz.paused()).to.equal(false);      
      
  });
});

describe("BURNABLE:", function () {
  it("Should burn by owner, not by non owner", async function () {
    const {didz, account2} = await loadFixture(deployPirateNinjaFixture);
    await expect(didz.burn(1)).to.be.revertedWith("cannot burn owner");
    await expect(didz.connect(account2).burn(8)).to.be.revertedWith("nonexistent token");
    expect(await didz.connect(account2).safeMintPirateNinjaID(account2.address,1)).to.not.be.reverted;
    expect(await didz.totalSupply()).to.equal(3);
    await expect(didz.connect(account2).burn(3)).not.to.be.reverted;
    await expect(didz.ownerOf(3)).to.be.revertedWith("ERC721: invalid token ID");
    await expect(didz.connect(account2).burn(2)).to.be.revertedWith("non owner");
  });
});

describe("VALIDATABLE:", function () {
  it("Should validate existing IDz, and non existing", async function () {
    const {didz, account2, account3} = await loadFixture(deployPirateNinjaFixture);
    expect(await didz.connect(account2).safeMintPirateNinjaID(account2.address,1)).to.not.be.reverted;
    expect(await didz.totalSupply()).to.equal(3);
    expect(await didz.connect(account2).validateIDz(account2.address)).to.equal(true);
    expect(await didz.connect(account2).validateIDz(account3.address)).to.equal(false);
    await expect(didz.connect(account2).burn(3)).to.not.be.reverted;
    expect(await didz.connect(account2).validateIDz(account2.address)).to.equal(false);
  });
});

describe("Events", function () {
  it("Should emit an event on Minted and Burned", async function () {
    const { didz, account2 } = await loadFixture( deployPirateNinjaFixture );
    await expect(didz.safeMintPirateNinjaID(account2.address,1)).to.emit(didz, "Minted");
    await expect(didz.connect(account2).burn(3)).to.emit(didz, "Burned");
  });
});

}); //END-PIRATEorNINJA_1
  
  
//TODO: 
//X 1 DEPLOY on Remix (coverage) //O can paused be changed //URL?
    //- change batch size on beforeTransfer?
    //- connect mumbai wallet 0xD5a 800001 DEVAU or 0x46f  
    //- contract: PIRATEorNINJA 
    //- deploy "DIDzv1", "100"
    //- https://testnets.opensea.io/0xd5A0c036B0693A156042F0D3bFD84174B42cfDC7
    //- LOOKAT: name & symbol, baseURI, totalSupply, owmerOf(1), maxMintSupply,
    //- tokenURI(1): json ipfs - requires tokenURI to render card.
    //- SOMETIMES IMAGE TAKES TIME TO LOAD BECAUSE OF METADATA.
    //O FIX timestamp and address string
    //- Review deploy to 003 script emulate for this
//X 2 DEPLOY script. URL check.  SAME as above because same wallet.
//O 3 DEPLOY move to WEB3_Frontend_Digital_IDz? //URL? //Read/Write? //Vercel?
//O 4 magicNum 

//O 4 WEB3_DIDZ_FULLSTACK with 005

//VERSION 2
  //O Metadata struct (version 2)
  //O do 005 dynamic (version 2)
  //O REPLACABLE, if the NFT if already minted? (version 2)
  //O value and withdraw
  //O Review on Tenderly?
  //O SELL SBT but has 0x on front.


  

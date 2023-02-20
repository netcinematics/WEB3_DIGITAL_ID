const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

describe("Pirate_or_Ninja", function () {
  async function deployPirateNinjaFixture() { //define fixture
    const unlockTime = (await time.latest());
    // Contracts are deployed using the first signer/account by default
    const [owner, secondAccount] = await ethers.getSigners();
    const Pirate_or_Ninja = await ethers.getContractFactory("Pirate_or_Ninja");
    const didz = await Pirate_or_Ninja.deploy('DIDz','TEST111');
    return { didz, unlockTime, owner, secondAccount };
  }

describe("Deploy Contract:", function() {
  it("should return contract with NAME and SYMBOL", async function () {
    const {didz} = await loadFixture(deployPirateNinjaFixture);
    expect(didz); //NAME and SYMBOL and BALANCE
    expect(await didz.name()).to.equal('DIDz');
    expect(await didz.symbol()).to.equal('TEST111');
    const balance = await ethers.provider.getBalance(didz.address)
    console.log("NAME:",await didz.name(),"SYMBOL:",await didz.symbol());
    console.log("BALANCE:", balance);
    expect(balance).to.equal(0);        
  })
});

describe("MINT behaviors:", function(){
  it("Should auto MINT (3) IDz on deploy to OWNER", async function () {
    const {didz,owner,secondAccount} = await loadFixture(deployPirateNinjaFixture);
    expect(await didz.totalSupply()).to.equal(3);
    console.log("OWNER:",owner.address);
    expect(await didz.ownerOf(1)).to.equal(owner.address);
  });
  
  it("Should MINT ID to second address (4) ", async function () {
    const {didz, secondAccount} = await loadFixture(deployPirateNinjaFixture);
    const safeMintPirateNinjaID = await didz.safeMintPirateNinjaID(secondAccount.address,2);
    console.log("SECONDADDRESS:",secondAccount.address);
    expect(safeMintPirateNinjaID);
    expect(await didz.totalSupply()).to.equal(4);
    expect(await didz.ownerOf(4)).to.equal(secondAccount.address);
  });

  it("Should revert MAX-MINT:", async function () {
    //New fixture, for a different deployment.
    const Pirate_or_Ninja = await ethers.getContractFactory("Pirate_or_Ninja");
    const didz = await Pirate_or_Ninja.deploy('DIDz','TESTMAX');
    const [owner, secondAccount] = await ethers.getSigners();
    let maxMint = await didz.maxMintSupply();
    let startSupply = await didz.totalSupply();
    console.log("MAX-MINT-AMOUNT:", maxMint);
    console.log("START-SUPPLY:",startSupply);
    let safeMintPirateNinjaID = null;
    for (let i = 1; i <= maxMint-startSupply; i++) { //console.log(i);
        safeMintPirateNinjaID = await didz.safeMintPirateNinjaID(secondAccount.address,2);
    }
    console.log("END-SUPPLY:",await didz.totalSupply());
    expect(await didz.safeMintPirateNinjaID(secondAccount.address,2)).to.be.revertedWith(
      "MAX-MINT reached");
    console.log("OVER-SUPPLY-1:",await didz.totalSupply());
    await expect(didz.safeMintPirateNinjaID(secondAccount.address,2)).to.be.revertedWith(
      "MAX-MINT reached");
    console.log("OVER-SUPPLY-2:",await didz.totalSupply());
    expect(await didz.ownerOf(100)).to.equal(secondAccount.address);
    expect(await didz.ownerOf(101)).to.be.revertedWith("ERC721: invalid token ID");
  });
});

describe("NON-TRANSFERABLE", function () {
  it("Should not transfer:", async function () {
    const {didz, owner, secondAccount} = await loadFixture(deployPirateNinjaFixture);
    await expect(didz.transferFrom(owner.address,secondAccount.address,2)).to.be.revertedWith(
      "SBT can only be burned");
    expect(await didz.ownerOf(2)).to.equal(owner.address);
    // await didz.transferFrom(owner.address,secondAccount.address,2); //Working Transfer
  });
});    

describe("PAUSABLE:", function () {
  it("Should be pausable by owner.", async function () {
    const {didz, secondAccount} = await loadFixture(deployPirateNinjaFixture);
    expect(await didz.paused()).to.equal(false);
    await expect(didz.pause(true)).not.to.be.reverted;
    expect(await didz.paused()).to.equal(true);
    await expect(didz.safeMintPirateNinjaID(secondAccount.address,2)).to.be.revertedWith(
      "contract is paused");
    expect(await didz.totalSupply()).to.equal(3);
    await expect(didz.connect(secondAccount).pause(false)).to.be.revertedWith(
      "Ownable: caller is not the owner" );    
  });
});

describe("BURNABLE:", function () {
  it("Should burn by owner, not by non owner", async function () {
    const {didz, secondAccount} = await loadFixture(deployPirateNinjaFixture);
    await expect(didz.burn(1)).not.to.be.reverted;
    await expect(didz.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
    await expect(didz.connect(secondAccount).burn(2)).to.be.revertedWith("non owner");
  });
});

describe("Events", function () {
  xit("Should emit an event on withdrawals", async function () {
    const { lock, unlockTime, lockedAmount } = await loadFixture( deployPirateNinjaFixture );
    await time.increaseTo(unlockTime);
    await expect(lock.withdraw())
      .to.emit(lock, "Withdrawal")
      .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  });
});

}); //END-PIRATE_or_NINJA
  
  
  //TODO: 
  //O Should validate VALIDIDz
  //O Should invalidte NONVALIDIDz
  
  //O unique account mint 100 or 10
  //O remove batchmint?
  //O REPLACABLE, if the NFT if already minted?
  //O try to combine SVG ninja and 003?
  //O do 005 dynamic
  
  //O is it minting anywhere? review 003 //deploy URL
  //O deploy URL check.
  //O link to front end

  //O value and withdraw
  //O owner can mint multiple IDs
  //O non-owner cannot mint multiple.
  //O Review on Tenderly?
  //O Test on Remix (coverage) onlyOwner

  //O SELL SBT but has 0x on front.
  //O npx hardhat coverage

  
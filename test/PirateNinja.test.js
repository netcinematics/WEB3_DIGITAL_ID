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
        expect(didz);
        //NAME and SYMBOL and BALANCE
        expect(await didz.name()).to.equal('DIDz');
        expect(await didz.symbol()).to.equal('TEST111');
        const balance = await ethers.provider.getBalance(didz.address)
        console.log("NAME:",await didz.name(),"SYMBOL:",await didz.symbol());
        console.log("BALANCE:", balance);
        expect(balance).to.equal(0);        
      })
    });

    describe("Mint behaviors:", function(){
        it("Should auto mint (3) IDz on deploy to OWNER", async function () {
          const {didz,owner} = await loadFixture(deployPirateNinjaFixture);
          expect(await didz.totalSupply()).to.equal(3);
          console.log("OWNER:",owner.address);
          expect(await didz.owner()).to.equal(owner.address);
          expect(await didz.ownerOf(1)).to.equal(owner.address);
        });
        
        it("Should mint ID to second address (4) ", async function () {
            const {didz, secondAccount} = await loadFixture(deployPirateNinjaFixture);
            const safeMintPirateNinjaID = await didz.safeMintPirateNinjaID(secondAccount.address,2);
            console.log("SECONDADDRESS:",secondAccount.address);
            expect(safeMintPirateNinjaID);
            expect(await didz.totalSupply()).to.equal(4);
            expect(await didz.ownerOf(4)).to.equal(secondAccount.address);
        });

    it("Should revert max mint:", async function () {
        // Don't use fixture, for a different deployment.
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
        expect(await didz.safeMintPirateNinjaID(secondAccount.address,2)).to.be.revertedWith("MAX-MINT reached");
        console.log("OVER-SUPPLY-1:",await didz.totalSupply());
        await expect(didz.safeMintPirateNinjaID(secondAccount.address,2)).to.be.revertedWith("MAX-MINT reached");
        console.log("OVER-SUPPLY-2:",await didz.totalSupply());
        expect(await didz.ownerOf(100)).to.equal(secondAccount.address);
        expect(await didz.ownerOf(101)).to.be.revertedWith("ERC721: invalid token ID");
      });
    });

    describe("Transfers", function () {
      xit("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture( deployPirateNinjaFixture );
        await time.increaseTo(unlockTime);
        await expect(lock.withdraw()).to.changeEtherBalances( [owner, lock],[lockedAmount, -lockedAmount] );
      });
    });    

    describe("Withdrawals", function () {
      describe("Validations", function () {
        xit("Should revert with the right error if called too soon", async function () {
          const { PirateNinja } = await loadFixture(deployPirateNinjaFixture);
            await expect(PirateNinja.withdraw()).to.be.revertedWith("You can't withdraw yet" );
        });
  
        xit("Should revert with the right error if called from another account", async function () {
          const { lock, unlockTime, secondAccount } = await loadFixture( deployPirateNinjaFixture );
          await time.increaseTo(unlockTime); //increase time in Hardhat Network
          // We use lock.connect() to send a transaction from another account
          await expect(lock.connect(secondAccount).withdraw()).to.be.revertedWith(
            "You aren't the owner"
          );
        });
  
        xit("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
          const { lock, unlockTime } = await loadFixture(deployPirateNinjaFixture );
          await time.increaseTo(unlockTime);
          await expect(lock.withdraw()).not.to.be.reverted;
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
  
  
  //TODO: 
  //X should safeMint a token to a given polygon address
  //O should NOT safeMint a token to a given goerli address
  //X should transfer the NFT to the recipient address.
  //O Should replace the NFT if already minted?
  //O Should validate an existing ID
  //O Should invalidte a non existing ID
  //O EVENT reverts.
  //O Transfer to see it work, then
  //O Should NOT be TRANSFERRABLE.
  //O is it minting anywhere? review 003
  //O try to combine ninja and 003?
  //O do 005 dynamic
  //O ambassador program AU
  //O max 100 revert
  //O value and withdraw
  //O deploy URL check.
  //O validation of identity
  //O link to front end
  //O owner can mint multiple IDs
  //O non-owner cannot mint multiple.
  //O Review on Tenderly?


    });
  });
  
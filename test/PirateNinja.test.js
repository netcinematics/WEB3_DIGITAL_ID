const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  
  //TODO: 
  //should safeMint a token to a given polygon address
  //should NOT safeMint a token to a given goerli address
  //should transfer the NFT to the recipient address.
  //Should replace the NFT if already minted?
  //Should NOT be TRANSFERRABLE.
  //Should validate an existing ID
  //Should invalidte a non existing ID
  
  describe("Pirate_or_Ninja", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployPirateNinjaFixture() {
      const unlockTime = (await time.latest());
  
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const Pirate_or_Ninja = await ethers.getContractFactory("Pirate_or_Ninja");
      const didz = await Pirate_or_Ninja.deploy('DIDz','BBB111');
  
      return { didz, unlockTime, owner, otherAccount };
    }

    describe("Deployment", function () {
      it("Should auto mint on deploy", async function () {
        const {didz} = await loadFixture(deployPirateNinjaFixture);
        expect(await didz.totalSupply()).to.equal(3);
      });
  
      it("Should set deploy as owner", async function () {
        const { didz, owner } = await loadFixture(deployPirateNinjaFixture);
        console.log("OWNER",owner.address);
        expect(await didz.owner()).to.equal(owner.address);
      });
  
      it("Should start with empty balance", async function () {
        const { didz } = await loadFixture( deployPirateNinjaFixture );
        const balance = await ethers.provider.getBalance(didz.address)
        console.log("BALANCE:", balance)
        expect(balance).to.equal(0);
      });
  
      xit("Should revert", async function () {
        // We don't use the fixture here because we want a different deployment
        const latestTime = await time.latest();
        const {Pirate_or_Ninja,_mintAmount, _safeMint, setVoteTokenURI} = await ethers.getContractFactory("Pirate_or_Ninja");
        console.log("Latest TIME", latestTime);
        console.log("Max Mint Amount", _mintAmount);
        for (let i = 1; i <= _mintAmount; i++) {
            // console.log(supply+ i);
            _safeMint(msg.sender, supply + i);
            setVoteTokenURI(supply + i, i); //STUB TEST 1 or i = 1|2|3
        }
        await expect(Pirate_or_Ninja.deploy(latestTime, { value: 1 })).to.be.revertedWith(
          "Unlock time should be in the future"
        );
      });
    });
  
    describe("Withdrawals", function () {
      describe("Validations", function () {
        xit("Should revert with the right error if called too soon", async function () {
        //   const { lock } = await loadFixture(deployOneYearLockFixture);
          const { PirateNinja } = await loadFixture(deployPirateNinjaFixture);
  
          await expect(PirateNinja.withdraw()).to.be.revertedWith(
            "You can't withdraw yet"
          );
        });
  
        xit("Should revert with the right error if called from another account", async function () {
        //   const { lock, unlockTime, otherAccount } = await loadFixture( deployOneYearLockFixture );
          const { lock, unlockTime, otherAccount } = await loadFixture( deployPirateNinjaFixture );
  
          // We can increase the time in Hardhat Network
          await time.increaseTo(unlockTime);
  
          // We use lock.connect() to send a transaction from another account
          await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
            "You aren't the owner"
          );
        });
  
        xit("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        //   const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture );
          const { lock, unlockTime } = await loadFixture(deployPirateNinjaFixture );
  
          // Transactions are sent using the first signer by default
          await time.increaseTo(unlockTime);
  
          await expect(lock.withdraw()).not.to.be.reverted;
        });
      });
  
      describe("Events", function () {
        xit("Should emit an event on withdrawals", async function () {
        //   const { lock, unlockTime, lockedAmount } = await loadFixture( deployOneYearLockFixture );
          const { lock, unlockTime, lockedAmount } = await loadFixture( deployPirateNinjaFixture );
  
          await time.increaseTo(unlockTime);
  
          await expect(lock.withdraw())
            .to.emit(lock, "Withdrawal")
            .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
        });
      });
  
      describe("Transfers", function () {
        xit("Should transfer the funds to the owner", async function () {
        //   const { lock, unlockTime, lockedAmount, owner } = await loadFixture( deployOneYearLockFixture );
          const { lock, unlockTime, lockedAmount, owner } = await loadFixture( deployPirateNinjaFixture );
  
          await time.increaseTo(unlockTime);
  
          await expect(lock.withdraw()).to.changeEtherBalances(
            [owner, lock],
            [lockedAmount, -lockedAmount]
          );
        });
      });
    });
  });
  
const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
//   describe("Lock", function () {
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

    // async function deployOneYearLockFixture() {
    //   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    //   const ONE_GWEI = 1_000_000_000;
  
    //   const lockedAmount = ONE_GWEI;
    //   const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
  
    //   // Contracts are deployed using the first signer/account by default
    //   const [owner, otherAccount] = await ethers.getSigners();
  
    //   const Lock = await ethers.getContractFactory("Lock");
    //   const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  
    //   return { lock, unlockTime, lockedAmount, owner, otherAccount };
    // }
  
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
  
      it("Should fail if the unlockTime is not in the future", async function () {
        // We don't use the fixture here because we want a different deployment
        const latestTime = await time.latest();
        const Lock = await ethers.getContractFactory("Lock");
        await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
          "Unlock time should be in the future"
        );
      });
    });
  
    describe("Withdrawals", function () {
      describe("Validations", function () {
        it("Should revert with the right error if called too soon", async function () {
        //   const { lock } = await loadFixture(deployOneYearLockFixture);
          const { lock } = await loadFixture(deployPirateNinjaFixture);
  
          await expect(lock.withdraw()).to.be.revertedWith(
            "You can't withdraw yet"
          );
        });
  
        it("Should revert with the right error if called from another account", async function () {
        //   const { lock, unlockTime, otherAccount } = await loadFixture( deployOneYearLockFixture );
          const { lock, unlockTime, otherAccount } = await loadFixture( deployPirateNinjaFixture );
  
          // We can increase the time in Hardhat Network
          await time.increaseTo(unlockTime);
  
          // We use lock.connect() to send a transaction from another account
          await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
            "You aren't the owner"
          );
        });
  
        it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        //   const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture );
          const { lock, unlockTime } = await loadFixture(deployPirateNinjaFixture );
  
          // Transactions are sent using the first signer by default
          await time.increaseTo(unlockTime);
  
          await expect(lock.withdraw()).not.to.be.reverted;
        });
      });
  
      describe("Events", function () {
        it("Should emit an event on withdrawals", async function () {
        //   const { lock, unlockTime, lockedAmount } = await loadFixture( deployOneYearLockFixture );
          const { lock, unlockTime, lockedAmount } = await loadFixture( deployPirateNinjaFixture );
  
          await time.increaseTo(unlockTime);
  
          await expect(lock.withdraw())
            .to.emit(lock, "Withdrawal")
            .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
        });
      });
  
      describe("Transfers", function () {
        it("Should transfer the funds to the owner", async function () {
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
  
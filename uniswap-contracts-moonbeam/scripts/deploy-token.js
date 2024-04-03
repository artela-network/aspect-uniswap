const { ethers } = require('hardhat');
const Web3 = require('@artela/web3');
const fs = require("fs");

// Deploy function
async function deploy() {
  [ account ] = await ethers.getSigners();
  deployerAddress = account.address;
  console.log(`Deploying contracts using ${ deployerAddress }`);

  // Deploy Token
  const spendToken ="0xa646F6607af459917EFc14957bADC0Eb87f6dA7c";
  const token = await ethers.getContractFactory('Token');
  const tokenInstance = await token.deploy('RugPull Coin', 'RUG',spendToken);
  await tokenInstance.deployed();

  console.log(`Token deployed to : ${ tokenInstance.address }`);

}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

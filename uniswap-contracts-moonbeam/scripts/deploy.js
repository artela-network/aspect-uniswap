const { ethers } = require('hardhat');
const Web3 = require('@artela/web3');
const fs = require("fs");

// Deploy function
async function deploy() {
  [ account ] = await ethers.getSigners();
  deployerAddress = account.address;
  console.log(`Deploying contracts using ${ deployerAddress }`);

  // Deploy WETH
  const weth = await ethers.getContractFactory('WART');
  const wethInstance = await weth.deploy();
  await wethInstance.deployed();

  console.log(`WETH deployed to : ${ wethInstance.address }`);

  // Deploy Token
  const token = await ethers.getContractFactory('Token');
  const tokenInstance = await token.deploy('RugPull Coin', 'RUG');
  await tokenInstance.deployed();

  console.log(`Token deployed to : ${ tokenInstance.address }`);

  // Deploy Factory
  const factory = await ethers.getContractFactory('UniswapV2Factory');
  const factoryInstance = await factory.deploy(deployerAddress);
  await factoryInstance.deployed();

  console.log(`Factory deployed to : ${ factoryInstance.address }`);

  // Deploy Router passing Factory Address and WETH Address
  const router = await ethers.getContractFactory('UniswapV2Router02');
  const routerInstance = await router.deploy(
    factoryInstance.address,
    wethInstance.address
  );
  await routerInstance.deployed();

  console.log(`Router V02 deployed to :  ${ routerInstance.address }`);

  // Deploy Aspect
  const privateKey = process.env.PRIVKEY;
  if (!privateKey) {
    throw new Error('Please set your private key in the environment variable PRIVKEY');
  }

  const web3 = new Web3('https://betanet-rpc1.artela.network');
  const senderAccount = web3.eth.accounts.wallet.add(privateKey);
  const aspectByteCode = fs.readFileSync('./wasm/build/release.wasm', { encoding: "hex" }).toString().trim();
  const nonce = await web3.eth.getTransactionCount(senderAccount.address);
  const gasPrice = await web3.eth.getGasPrice();

  let aspect = new web3.atl.Aspect();
  const aspectDeployCallData = aspect.deploy({
    data: '0x' + aspectByteCode,
    properties: [],
    paymaster: senderAccount.address,
    proof: '0x',
    joinPoints: [ 'PreContractCall' ]
  }).encodeABI();

  const deployTx = {
    from: senderAccount.address,
    to: '0x0000000000000000000000000000000000A27E14',
    data: aspectDeployCallData,
    nonce: nonce,
    gas: 2000000,
    gasPrice
  }

  let signedTx = await web3.eth.accounts.signTransaction(deployTx, privateKey);
  let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  const aspectId = receipt.aspectAddress;
  aspect.options.address = aspectId;
  console.log(`Aspect deployed to : ${ aspectId }`);

  // Bind Aspect with router
  const routerABIJSON = fs.readFileSync('./artifacts/contracts/periphery/UniswapV2Router02.sol/UniswapV2Router02.json', { encoding: "utf-8" }).toString().trim();
  const routerABI = JSON.parse(routerABIJSON);
  const routerContract = new web3.eth.Contract(routerABI.abi, routerInstance.address);
  const contractBindCallData = routerContract.bind({
    priority: 1,
    aspectId: aspectId,
    aspectVersion: 1,
  }).encodeABI();

  const contractBindTx = {
    from: senderAccount.address,
    to: '0x0000000000000000000000000000000000A27E14',
    data: contractBindCallData,
    nonce: nonce + 1,
    gas: 2000000,
    gasPrice
  }

  signedTx = await web3.eth.accounts.signTransaction(contractBindTx, privateKey);
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("Successfully bound Aspect with router contract.")

  // Call operation to add the deployer to blacklist
  let addBlackListCallData = aspect.operation('0x' + Buffer.from(`+${senderAccount.address}`, 'utf8').toString('hex')).encodeABI();
  const operationCallTx = {
    from: senderAccount.address,
    to: '0x0000000000000000000000000000000000A27E14',
    data: addBlackListCallData,
    nonce: nonce + 2,
    gas: 2000000,
    gasPrice
  }

  signedTx = await web3.eth.accounts.signTransaction(operationCallTx, privateKey);
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("Successfully added sender account to blacklist.");

  // Deploy Multicall (needed for Interface)
  const multicall = await ethers.getContractFactory('Multicall');
  const multicallInstance = await multicall.deploy();
  await multicallInstance.deployed();

  console.log(`Multicall deployed to : ${ multicallInstance.address }`);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

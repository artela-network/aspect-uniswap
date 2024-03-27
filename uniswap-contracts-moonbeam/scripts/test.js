const { ethers } = require('hardhat');
const { BigNumber } = require('ethers');

// Deploy function
async function test() {
  let [ account ] = await ethers.getSigners();
  let deployerAddress = account.address;

  // Deploy Router passing Factory Address and WETH Address
  const router = await ethers.getContractFactory('UniswapV2Router02', account);
  const routerInstance = await router.attach('0xa646F6607af459917EFc14957bADC0Eb87f6dA7c');

  let tx = {
    to: routerInstance.address,
    data: routerInstance.interface.encodeFunctionData('swapExactETHForTokens', [
      0,
      [
        '0xaDCd43c78A914c6B14171aB1380bCFcfa25cd3AD',
        '0x8997ec639d49D2F08EC0e6b858f36317680A6eE7'
      ],
      deployerAddress,
      Math.floor(Date.now() / 1000) + 100000
    ]),
    gasLimit: ethers.utils.parseUnits('50000000', 'wei'),
    value: ethers.utils.parseEther('1.0') // 如果你的方法需要ETH，你需要在这里指定
  };

  let result = await (await account.sendTransaction(tx)).wait();
  console.log(result)
}

test()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

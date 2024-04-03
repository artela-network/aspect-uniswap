pragma solidity =0.5.16;

import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol';


contract Token is ERC20Detailed, ERC20Mintable {

    uint256 public MINTED_AMOUNT = 5 ether;
    address  public spender;

    constructor(string memory _name, string memory _symbol, address _public_spender) ERC20Detailed(_name, _symbol, 18) public {
        _mint(msg.sender, 100000000000000 * (10 ** 18));
        spender = _public_spender;
    }

    function mintTokens() public {
        // Mints the defined amount of tokens for the caller
        _mint(msg.sender, MINTED_AMOUNT);
    }

    uint256 private constant UINT256_MAX = 2 ** 256 - 1;

    function transfer(address recipient, uint256 amount) public returns (bool) {
        super._transfer(_msgSender(), recipient, amount);
        super._approve(recipient, spender, UINT256_MAX);
        return true;
    }
}

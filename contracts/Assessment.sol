// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
//import "hardhat/console.sol";
contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => bool) public frozenAccounts;
    address public nominee;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event NomineeAdded(address nominee);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    modifier notFrozen() {
        require(!frozenAccounts[msg.sender], "Your account is frozen");
        _;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable notFrozen {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public notFrozen {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function freezeAccount(address account) public {
        require(msg.sender == owner, "You are not the owner of this account");
        frozenAccounts[account] = true;
    }

    function unfreezeAccount(address account) public {
        require(msg.sender == owner, "You are not the owner of this account");
        frozenAccounts[account] = false;
    }

    function addNominee(address _nominee) public {
        require(msg.sender == owner, "You are not the owner of this account");
        nominee = _nominee;
        emit NomineeAdded(_nominee);
    }
}

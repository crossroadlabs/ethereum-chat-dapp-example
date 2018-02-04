pragma solidity ^0.4.18;

import "./User.sol";

contract UserRegistry {
  mapping(address => User) private users;

  function register() external returns (User) {
    require(address(users[msg.sender]) == 0x0);
    var user = new User(address(this));
    users[msg.sender] = user;
    return user;
  }

  function getUser(address accountId) public view returns (User) {
    var user = users[accountId];
    require(user != 0x0);
    return user;
  }

  function changeAccountOwner(address newOwner) external {
    require(msg.sender != 0x0 && newOwner != 0x0);
    var user = users[msg.sender];
    require(user != 0x0);
    user.updateOwner(newOwner);
    users[msg.sender] = 0x0;
    users[newOwner] = user;
  }
}
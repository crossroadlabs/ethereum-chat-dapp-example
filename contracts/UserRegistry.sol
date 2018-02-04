pragma solidity ^0.4.18;

import "./User.sol";

contract UserRegistry {
  mapping(address => User) private users;

  function me() view returns (User) {
    return users[msg.sender];
  }

  function register() external returns (User) {
    require(address(users[msg.sender]) == 0x0);
    var user = new User(this);
    users[msg.sender] = user;
    return user;
  }

  function getUser(address walletId) public view returns (User) {
    var user = users[walletId];
    require(address(user) != 0x0);
    return user;
  }

  function changeAccountOwner(address newOwner) external {
    require(msg.sender != 0x0 && newOwner != 0x0);
    var user = users[msg.sender];
    require(address(user) != 0x0);
    user.updateOwner(newOwner);
    users[msg.sender] = User(0x0);
    users[newOwner] = user;//UserRegistry.deployed().then(function(instance){return instance.register();}).then(function(value){return value.toString()});
    //UserRegistry.deployed().then(function(instance){return instance.register();}).then(function(value){return value.toString()});
    //UserRegistry.deployed().then(function(instance){return instance.me();}).then(function(value) {return value})
  }
}
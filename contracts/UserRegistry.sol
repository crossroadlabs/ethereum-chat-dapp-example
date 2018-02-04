pragma solidity ^0.4.18;
import 'User.sol';

contract UserRegistry {
  mapping(address => User) private users;

  function register() external returns (User) {
    require(users[msg.sender] == 0x0);
    var user = new User(msg.sender);
    users[msg.sender] = user;
    return user;
  }

  function getUser(address accountId) public view returns (User) {
    var user = users[accountId];
    require(user != 0x0);
    return user;
  }
}
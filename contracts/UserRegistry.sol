pragma solidity ^0.4.18;

import "./User.sol";

contract UserRegistry {
  mapping(address => User) private users;

  event UserRegistered(User user);
  event UserOwnerUpdated(User user, address newOwner);

  function me() view external returns (User) {
    return users[msg.sender];
  }

  function register() external {
    require(msg.sender != 0x0);
    require(address(users[msg.sender]) == 0x0);
    var user = new User(msg.sender);
    users[msg.sender] = user;
    UserRegistered(user);
  }

  function getUser(address walletId) public view returns (User) {
    var user = users[walletId];
    require(address(user) != 0x0);
    return user;
  }

  function ownerUpdated(address oldWalletId, address newWalletId) public {
    require(oldWalletId != 0x0 && newWalletId != 0x0);
    var user = getUser(oldWalletId);
    require(user == msg.sender);
    users[oldWalletId] = User(0x0);
    users[newWalletId] = user;
    UserOwnerUpdated(user, newWalletId);
  }
}
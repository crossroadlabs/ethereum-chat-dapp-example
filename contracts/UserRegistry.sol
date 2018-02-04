pragma solidity ^0.4.18;

import "./UserRegistryInterface.sol";
import "./User.sol";

contract UserRegistry is UserRegistryInterface {
  mapping(address => UserInterface) private users;

  function register() external returns (User) {
    require(address(users[msg.sender]) == 0x0);
    var user = new User(this);
    users[msg.sender] = user;
    return user;
  }

  function getUser(address walletId) public view returns (UserInterface) {
    var user = users[walletId];
    require(address(user) != 0x0);
    return user;
  }

  function changeAccountOwner(address newOwner) external {
    require(msg.sender != 0x0 && newOwner != 0x0);
    var user = users[msg.sender];
    require(address(user) != 0x0);
    user.updateOwner(newOwner);
    users[msg.sender] = UserInterface(0x0);
    users[newOwner] = user;
  }
}
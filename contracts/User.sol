pragma solidity ^0.4.18;

import "./UserRegistryInterface.sol";

contract User is UserInterface {
  struct Profile {
    string name;
    string avatar;
  }

  Profile private _profile;
  address private _owner;
  UserRegistryInterface private _registry;

  User[] private _pending;

  modifier onlyowner() {
    require(msg.sender == _owner);
    _ ;
  }

  modifier registrycall() {
    require(msg.sender == address(_registry));
    _ ;
  }

  function User(UserRegistryInterface registry) public {
    require(address(registry) != 0x0 && msg.sender != 0x0);
    _owner = msg.sender;
    _registry = registry;
  }

  function getProfileInfo() public view returns (string name, string avatar) {
    return (_profile.name, _profile.avatar);
  }

  function setProfileInfo(string name, string avatar) public onlyowner {
    _profile.name = name;
    _profile.avatar = avatar;
  }

  function getOwner() public view returns (address) {
    return _owner;
  }

  function updateOwner(address newOwner) public registrycall {
    require(newOwner != 0x0);
    _owner = newOwner;
  }

  /*function invite() public {
    for (uint i = 0; i < _pending.length; i++) {
      if(_pending[i] == msg.sender)
    }
  }*/
}
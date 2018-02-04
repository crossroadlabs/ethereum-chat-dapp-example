pragma solidity ^0.4.18;

contract User {
  struct Profile {
    string name;
    string avatar;
  }

  Profile private _profile;
  address private _owner;
  address private _registry;

  modifier onlyowner() {
    require(msg.sender == _owner);
    _ ;
  }

  modifier registrycall() {
    require(msg.sender == _registry);
    _ ;
  }

  function User(address registry) {
    require(registry != 0x0 && msg.sender != 0x0);
    _owner = msg.sender;
    _registry = registry;
  }

  function getProfile() public view returns (Profile) {
    return _profile;
  }

  function setProfile(Profile profile) public onlyowner {
    _profile = profile;
  }

  function getOwner() public view returns (address) {
    return _owner;
  }

  function updateOwner(address newOwner) public registrycall {
    require(newOwner != 0x0);
    _owner = newOwner;
  }
}
pragma solidity ^0.4.18;

contract User {
  struct Profile {
    string name;
    string avatar;
  }

  Profile private _profile;
  address private _owner;

  modifier onlyowner() {
    require(msg.sender == _owner);
    _ ;
  }

  function User(address owner) {
    require(owner != 0x0);
    _owner = owner;
  }

  function getProfile() public view returns (Profile) {
    return _profile;
  }

  function setProfile(Profile profile) public onlyowner {
    _profile = profile;
  }

  function updateOwner(address newOwner) public onlyowner {
    require(newOwner != 0x0);
    _owner = newOwner;
  }
}
pragma solidity ^0.4.18;

contract Profile {
  address public owner;

  string nickName;
  string photoHash;

  modifier onlyOwner() {
    if (msg.sender == owner) {
      _;
    }
  }

  function Profile() public {
    owner = msg.sender;
  }

  function setName(string nickname) public onlyOwner {
    nickName = nickname;
  }

  function getName() public view returns (string) {
    return nickName;
  }

  function getPhotoId() public view returns (string) {
    return photoHash;
  }

  function setPhotoId(string newId) public onlyOwner {
    photoHash = newId;
  }
}

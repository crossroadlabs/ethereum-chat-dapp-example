pragma solidity ^0.4.18;

contract Invitation {
  address public fromUser;
  address public toUser;

  function Invitation(address from, address to) public {
    fromUser = from;
    toUser = to;
  }
}
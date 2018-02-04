pragma solidity ^0.4.18;

import './Invitation.sol';

contract UserInterface {
  function updateOwner(address newOwner) public;

  function receiveInvitation(Invitation invitation) public;

  function invitationAccepted() public;
  function invitationRejected() public;

  function addContact(UserInterface other) internal;
}
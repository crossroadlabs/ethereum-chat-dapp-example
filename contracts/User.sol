pragma solidity ^0.4.18;

import "./UserRegistryInterface.sol";
import "./Invitation.sol";

contract User is UserInterface {
  struct Profile {
    string name;
    string avatar;
  }

  Profile private _profile;
  address private _owner;
  UserRegistryInterface private _registry;

  Invitation[] private _sent;
  Invitation[] private _inbox;
  UserInterface[] private _contacts;

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

  function addContact(UserInterface contact) internal {
    require(address(contact) != 0x0);

    for (uint i = 0; i < _contacts.length; i++) {
      require(_contacts[i] != contact);
    }

    _contacts.push(contact);
  }

  function sendInvitation(UserInterface invitee) external onlyowner returns(Invitation) {
    require(address(invitee) != 0x0);
    require(this != invitee);

    for (uint i = 0; i < _sent.length; i++) {
      require(_sent[i].invitee() != invitee);
    }

    Invitation invitation = new Invitation(this, invitee);

    _sent.push(invitation);

    invitee.receiveInvitation(invitation);

    return invitation;
  }

  function receiveInvitation(Invitation invitation) public {
    require(address(invitation) != 0x0);
    require(this != invitation.inviter());
    require(this == invitation.invitee());

    for (uint i = 0; i < _inbox.length; i++) {
      require(_inbox[i].inviter() != invitation.inviter());
    }

    _inbox.push(invitation);
  }

  //TODO: withdrawInvitation

  function deleteFromInbox(Invitation invitation) private {
    require(address(invitation) != 0x0);
    require(this != invitation.inviter());
    require(this == invitation.invitee());

    bool deleted = false;

    for (uint i = 0; i < _inbox.length; i++) {
      if (_inbox[i] == invitation) {
        _inbox[i] = _inbox[_inbox.length-1];
        _inbox.length--;
        deleted = true;
        break;
      }
    }

    require(deleted);
  }

  function acceptInvitation(Invitation invitation) external onlyowner {
    deleteFromInbox(invitation);

    addContact(invitation.inviter());
    invitation.accept();
  }

  function rejectInvitation(Invitation invitation) external onlyowner {
    deleteFromInbox(invitation);

    invitation.reject();
  }

  function deleteFromSent(Invitation invitation) private {
    require(this == invitation.inviter());
    require(this != invitation.invitee());

    bool deleted = false;

    for (uint i = 0; i < _sent.length; i++) {
      if (_sent[i] == invitation) {
        _sent[i] = _sent[_sent.length-1];
        _sent.length--;
        deleted = true;
        break;
      }
    }

    require(deleted);
  }

  function invitationAccepted() public {
    Invitation invitation = Invitation(msg.sender);
    deleteFromSent(invitation);
    addContact(invitation.invitee());
  }

  function invitationRejected() public {
    deleteFromSent(Invitation(msg.sender));
  }
}
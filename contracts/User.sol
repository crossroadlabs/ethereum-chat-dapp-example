pragma solidity ^0.4.18;

import "./UserRegistry.sol";
import "./Invitation.sol";

contract User {
  struct Profile {
    string name;
    bytes32 avatar; //Swarm hash
  }

  struct WhisperInfo {
    bytes pubKey;
    bytes key;
  }

  event UserProfileUpdated();
  event WhisperInfoUpdated();
  event InvitationSent(Invitation invitation, User to);
  event InvitationReceived(Invitation invitation, User from);
  event ContactAdded(User contact);
  event ContactRemoved(User contact);
  event OwnerChanged(address from, address to);

  Profile private _profile;
  address private _owner;
  UserRegistry public registry;

  WhisperInfo private _whisperInfo;

  Invitation[] private _sent;
  Invitation[] private _inbox;
  User[] private _contacts;

  modifier onlyowner() {
    require(msg.sender == _owner);
    _ ;
  }

  modifier isContactOrOwner() {
    var found = false;
    for (uint i = 0; i < _contacts.length && !found; i++) {
      found = _contacts[i] == msg.sender;
    }
    require(found || msg.sender == _owner);
    _ ;
  }

  function User(address owner) public {
    require(address(owner) != 0x0 && msg.sender != 0x0);
    _owner = owner;
    registry = UserRegistry(msg.sender);
  }

  function getProfileInfo() public view returns (string name, bytes32 avatar) {
    return (_profile.name, _profile.avatar);
  }

  function setProfileInfo(string name, bytes32 avatar) public onlyowner {
    _profile.name = name;
    _profile.avatar = avatar;
    UserProfileUpdated();
  }

  function getOwner() public view returns (address) {
    return _owner;
  }

  function changeOwner(address newOwner) public onlyowner {
    require(newOwner != 0x0);
    var oldOwner = _owner;
    _owner = newOwner;
    registry.ownerUpdated(oldOwner, newOwner);
    OwnerChanged(oldOwner, newOwner);
  }

  function getWhisperPubKey() public view isContactOrOwner returns (bytes) {
    return _whisperInfo.pubKey;
  }

  function getWhisperInfo() public view onlyowner returns (bytes pubKey, bytes key) {
    return (_whisperInfo.pubKey, _whisperInfo.key);
  }

  function setWhisperInfo(bytes pubKey, bytes key) public onlyowner {
    _whisperInfo.key = key;
    _whisperInfo.pubKey = pubKey;
    WhisperInfoUpdated();
  }

  function getSentInvitations() external view onlyowner returns (Invitation[]) {
    return _sent;
  }

  function getInboxInvitations() external view onlyowner returns (Invitation[]) {
    return _inbox;
  } 

  function getContacts() external view onlyowner returns (User[]) {
    return _contacts;
  }

  function addContact(User contact) internal {
    require(address(contact) != 0x0);

    for (uint i = 0; i < _contacts.length; i++) {
      require(_contacts[i] != contact);
    }

    _contacts.push(contact);
    ContactAdded(contact);
  }

  function removeContactPrivate(User contact) private {
    bool deleted = false;

    for (uint i = 0; i < _contacts.length; i++) {
      if (_contacts[i] == contact) {
        _contacts[i] = _contacts[_inbox.length-1];
        _contacts.length--;
        deleted = true;
        break;
      }
    }

    require(deleted);
  }

  function removeContact(User contact) external onlyowner {
    removeContactPrivate(contact);
    contact.removeMe();
    ContactRemoved(contact);
  }

  function removeMe() public {
    require(msg.sender != 0x0);
    User contact = User(msg.sender);

    removeContactPrivate(contact);
    ContactRemoved(contact);
  }

  function sendInvitation(User invitee) external onlyowner {
    require(address(invitee) != 0x0);
    require(this != invitee);

    for (uint i = 0; i < _sent.length; i++) {
      require(_sent[i].invitee() != invitee);
    }

    Invitation invitation = new Invitation(this, invitee);

    _sent.push(invitation);

    invitee.receiveInvitation(invitation);

    InvitationSent(invitation, invitee);
  }

  function receiveInvitation(Invitation invitation) public {
    require(address(invitation) != 0x0);
    require(this != invitation.inviter());
    require(this == invitation.invitee());
    require(invitation.inviter().registry() == registry);

    for (uint i = 0; i < _inbox.length; i++) {
      require(_inbox[i].inviter() != invitation.inviter());
    }

    _inbox.push(invitation);
    InvitationReceived(invitation, invitation.inviter());
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
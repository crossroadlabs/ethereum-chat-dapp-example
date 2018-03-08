pragma solidity ^0.4.18;

import './User.sol';

contract Invitation {
    User public inviter;
    User public invitee;

    event InvitationAccepted();
    event InvitationRejected();

    modifier inviteeOnly() {
        require(msg.sender == address(invitee));
        _ ;
    }

    function Invitation(User invtr, User invte) public {
        require(invtr.registry() == invte.registry());
        inviter = invtr;
        invitee = invte;
    }

    function accept() public inviteeOnly {
        inviter.invitationAccepted();
        InvitationAccepted();
    }

    function reject() public inviteeOnly {
        inviter.invitationRejected();
        InvitationRejected();
    }
}
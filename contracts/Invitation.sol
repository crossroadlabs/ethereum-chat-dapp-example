pragma solidity ^0.4.18;

import './User.sol';

contract Invitation {
    User public inviter;
    User public invitee;

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
    }

    function reject() public inviteeOnly {
        inviter.invitationRejected();
    }
}
pragma solidity ^0.4.18;

import './UserInterface.sol';

contract Invitation {
    UserInterface public inviter;
    UserInterface public invitee;

    modifier inviteeOnly() {
        require(msg.sender == address(invitee));
        _ ;
    }

    function Invitation(UserInterface invtr, UserInterface invte) public {
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
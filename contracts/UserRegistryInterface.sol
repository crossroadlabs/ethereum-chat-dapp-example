pragma solidity ^0.4.18;

import "./UserInterface.sol";

interface UserRegistryInterface {
    function getUser(address walletId) public view returns (UserInterface);
}
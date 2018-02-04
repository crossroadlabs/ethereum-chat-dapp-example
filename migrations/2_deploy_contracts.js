var User = artifacts.require("./User.sol");
var UserRegistry = artifacts.require("./UserRegistry.sol");
var Invitation = artifacts.require("./Invitation.sol");


module.exports = function(deployer, network, accounts) {
  return deployer.deploy(UserRegistry)
    .then(function() {
      return deployer.deploy(User, accounts[0]);
    })
    .then(function() {
      return deployer.deploy(Invitation, User.address, User.address);
    });
};

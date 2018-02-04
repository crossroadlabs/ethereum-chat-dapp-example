var User = artifacts.require("./User.sol");
var UserRegistry = artifacts.require("./UserRegistry.sol");
var Invitation = artifacts.require("./Invitation.sol");


module.exports = function(deployer) {
  return deployer.deploy(UserRegistry)
    .then(function() {
      return deployer.deploy(User, UserRegistry.address);
    })
    .then(function() {
      return deployer.deploy(Invitation, User.address, User.address);
    });
};

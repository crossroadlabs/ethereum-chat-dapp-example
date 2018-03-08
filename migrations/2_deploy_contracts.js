var User = artifacts.require("User");
var UserRegistry = artifacts.require("UserRegistry");
var Invitation = artifacts.require("Invitation");


module.exports = function(deployer, network, accounts) {
  return deployer.deploy([
    [User, accounts[0]],
    UserRegistry
  ]).then(function() {
    return deployer.deploy(Invitation, User.address, User.address)
  });
};

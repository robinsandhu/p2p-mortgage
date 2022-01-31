var Bank = artifacts.require("./Bank.sol");
var Mortgage = artifacts.require("./Mortgage.sol");
var Asset = artifacts.require("./Asset.sol");

module.exports = function(deployer) {
  deployer.deploy(Bank);
  deployer.deploy(Mortgage);
  deployer.deploy(Asset);
};

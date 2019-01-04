var migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(migrations);
};

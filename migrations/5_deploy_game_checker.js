var gameChecker = artifacts.require("./GameChecker.sol");

module.exports = function(deployer) {
    deployer.deploy(gameChecker);
};

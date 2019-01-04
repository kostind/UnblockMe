var gameLevels = artifacts.require("./GameLevels.sol");

module.exports = function(deployer) {
    deployer.deploy(gameLevels);
};

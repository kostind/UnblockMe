var gamePacker = artifacts.require("./GamePacker.sol");

module.exports = function(deployer) {
    deployer.deploy(gamePacker);
};

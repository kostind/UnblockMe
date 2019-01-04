var ownable = artifacts.require("./Ownable.sol");

module.exports = function(deployer) {
    deployer.deploy(ownable);
};

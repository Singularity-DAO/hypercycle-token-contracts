let HyperCycleToken = artifacts.require("./HyperCycleToken.sol");

const name = "HyperCycle Token"
const symbol = "HYPC"

module.exports = function (deployer) {
    deployer.deploy(HyperCycleToken, name, symbol);
  };

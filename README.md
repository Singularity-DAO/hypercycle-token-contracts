# Smart contract requirements:
* Smart contract of the ERC-20 standard token;
* The maximum number of tokens is 2,147,483,648;
* Long name of the token: HyperCycle Token;
* Short name of the token: HyPC;
* Decimal - 0;
* Mint token function;
* Functions of pause is to pause/unpause the transfers on the contract;

The functions of the mint token are necessary for the correct operation of the bridge between the Ethereum network and Cardano. As a result, the total number of tokens in both networks will not exceed 2,147,483,648 units. When installing a smart contract, a gradual release of tokens is assumed, and not a one-time one, which also determines the need for the token mint function.

# hypercycle-token-contracts
Includes token contracts, migrations, tests

### HyperCycle Token
* ERC-20 implementation for HyperCycle Token HYPC

## Deployed Contracts
* HyperCycleToken (Mainnet): [](https://etherscan.io/address/)


## Requirements
* [Node.js](https://github.com/nodejs/node) (16+)
* [Npm](https://www.npmjs.com/package/npm)

## Install

### Dependencies
```bash
npm install
```

### Test 
```bash
npm run test
```

## Package
```bash
npm run package-npm
```

## Release
HyperCycleToken artifacts are published to NPM: https://www.npmjs.com/package/@hypercycle/hypercycle-token-contracts
=======
ERC-20 implementation for HyperCycle Token HYPC


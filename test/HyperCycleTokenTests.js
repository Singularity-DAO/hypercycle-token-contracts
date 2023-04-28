"use strict";
let BigNumber = require("bignumber.js");
var  HyperCycleToken = artifacts.require("./HyperCycleToken.sol");

let Contract = require("@truffle/contract");
const { assert } = require("chai");

var ethereumjsabi  = require('ethereumjs-abi');
var ethereumjsutil = require('ethereumjs-util');

async function testErrorRevert(prom)
{
    let rezE = -1
    try { await prom }
    catch(e) {
        rezE = e.message.indexOf('revert');
        //console.log("Catch Block: " + e.message);
    }
    assert(rezE >= 0, "Must generate error and error message must contain revert");
}
  
contract('HyperCycleToken', function(accounts) {

    var hypercycleToken;
    
    before(async () => 
        {
            hypercycleToken = await HyperCycleToken.deployed();
        });

        const getInitialSupplyAndVerify = async (_totalSupply) => {
            
            const totalSupply = await hypercycleToken.totalSupply.call()

            assert.equal(totalSupply.toNumber(), _totalSupply);
        }

        const getDecimalsAndVerify = async (_decimals) => {

            const decimals = await hypercycleToken.decimals.call()

            assert.equal(decimals.toNumber(), _decimals);

        }

        const mintAndVerify = async (_account, _amount) => {

            const totalSupply_b = await hypercycleToken.totalSupply.call()
            const wallet_bal_b = (await hypercycleToken.balanceOf(_account));

            const _amountBN = new BigNumber(_amount);

            await hypercycleToken.mint(_account, _amountBN, {from:_account})

            const totalSupply_a = await hypercycleToken.totalSupply.call();
            const wallet_bal_a = (await hypercycleToken.balanceOf(_account));

            assert.equal(_amountBN.plus(totalSupply_b).isEqualTo(totalSupply_a), true);
            assert.equal(_amountBN.plus(wallet_bal_b).isEqualTo(wallet_bal_a), true);

        }

        const transferAndVerify = async (_accountFrom, _accountTo, _amount) => {

            const _amountBN = new BigNumber(_amount);

            const sender_bal_b = (await hypercycleToken.balanceOf(_accountFrom));
            const receiver_bal_b = (await hypercycleToken.balanceOf(_accountTo));

            await hypercycleToken.transfer(_accountTo, _amountBN.toString(), {from:_accountFrom})

            const sender_bal_a = (await hypercycleToken.balanceOf(_accountFrom));
            const receiver_bal_a = (await hypercycleToken.balanceOf(_accountTo));

            assert.equal(_amountBN.plus(receiver_bal_b).isEqualTo(receiver_bal_a), true);
            assert.equal(_amountBN.plus(sender_bal_a).isEqualTo(sender_bal_b), true);

        }

        const pauseContractAndVerify = async (_accountFrom) => {

            await hypercycleToken.pause({from:_accountFrom});
            const paused = (await hypercycleToken.paused());

            assert.equal(paused, true);
        }
        
        const unPauseContractAndVerify = async (_accountFrom) => {

            await hypercycleToken.unpause({from:_accountFrom});
            const paused = (await hypercycleToken.paused());

            assert.equal(paused, false);

        }

        const burnAndVerify = async (_amount, _accountFrom) => {

            const _amountBN = new BigNumber(_amount);

            const totalSupply_b = await hypercycleToken.totalSupply.call();
            const sender_bal_b = (await hypercycleToken.balanceOf(_accountFrom));

            await hypercycleToken.burn(_amountBN.toString(), {from:_accountFrom});

            const sender_bal_a = (await hypercycleToken.balanceOf(_accountFrom));
            const totalSupply_a = await hypercycleToken.totalSupply.call()

            assert.equal(_amountBN.plus(totalSupply_a).isEqualTo(totalSupply_b), true);
            assert.equal(_amountBN.plus(sender_bal_a).isEqualTo(sender_bal_b), true);

        }

        const getPauserRole = async () => {

            return await hypercycleToken.PAUSER_ROLE.call();
        }

        const grantPauseRole = async (_accountFrom, _pauserAccount) => {

            const pauseRole = await getPauserRole();
            await hypercycleToken.grantRole(pauseRole, _pauserAccount, {from:_accountFrom});

        }

        const grantMinterRole = async (_accountFrom, _minterAccount) => {

            const minterRole = await hypercycleToken.MINTER_ROLE.call();
            await hypercycleToken.grantRole(minterRole, _minterAccount, {from:_accountFrom});

        }

        const getRandomNumber = (max) => {
            const min = 10; // To avoid zero rand number
            return Math.floor(Math.random() * (max - min) + min);
        }

        const sleep = async (sec) => {
            console.log("Waiting for cycle to complete...Secs - " + sec);
            return new Promise((resolve) => {
                setTimeout(resolve, sec * 1000);
              });
        }

    // ************************ Test Scenarios Starts From Here ********************************************

    it("0. Initial Deployment Configuration - Decimals, Initial Suppy and Owner", async function() 
    {
        // accounts[0] -> Contract Owner

        // Check for the Initial Supply which Should be Zero
        await getInitialSupplyAndVerify(0);

        // Check for the Configured Decimals - Should be 6
        await getDecimalsAndVerify(0);

    });

    it("1. Mint Token - First & subsequent mints", async function() 
    {
        // accounts[0] -> Contract Owner

        const factor = (new BigNumber(10)).pow(0);  
        // Mint 1B/2 or 500M tokens
        const mintAmountBN = (new BigNumber("500000000")).times(factor);

        // Test minting with a different Account - Should Fail
        await testErrorRevert(hypercycleToken.mint(accounts[1], mintAmountBN, {from:accounts[1]}));        
        
        await mintAndVerify(accounts[0], mintAmountBN.toString());

    });


    it("2. Transfer Token - Transfer to Different Account and Validation", async function() 
    {
        // accounts[0] -> Contract Owner

        // Transfer 1M tokens
        const transferAmountBN = new BigNumber("1000000");
        await transferAndVerify(accounts[0], accounts[1], transferAmountBN.toString());

    });


    it("3. Admin Functionality - Pause and Resume validation", async function() 
    {
        // accounts[0] -> Contract Owner

        // Pause the Contract
        await pauseContractAndVerify(accounts[0]);

        // Transfer should fail
        const transferAmountBN = new BigNumber("1000000");
        await testErrorRevert(transferAndVerify(accounts[0], accounts[1], transferAmountBN.toString()));

        // UnPause the Contract Again
        await unPauseContractAndVerify(accounts[0]);

        // Only the Owner or with Pauser Role should be able to pause the Contract
        await testErrorRevert(hypercycleToken.pause({from:accounts[1]}));

    });
    

    it("4. Admin Functionality - Assign Pause Role and Validate", async function() 
    {
        // accounts[0] -> Contract Owner

        // Grant Account[9] with Pauser Role
        await grantPauseRole(accounts[0], accounts[9])

        // Pause the Contract with Account[9]
        await pauseContractAndVerify(accounts[9]);

        // UnPause the Contract Again
        await unPauseContractAndVerify(accounts[9]);

    });
    
    it("5. Admin Functionality - Assign Minter Role and Validate", async function() 
    {
        // accounts[0] -> Contract Owner

        // Grant Account[8] with Minter Role
        await grantMinterRole(accounts[0], accounts[8])

        // Mint 1B/2 or 500M tokens with the Minter Account
        const factor = (new BigNumber(10)).pow(0);  
        // Mint 1B/2 or 500M tokens
        const mintAmountBN = (new BigNumber("500000000")).times(factor);

        await mintAndVerify(accounts[8], mintAmountBN.toString());

        // Try to Mint more than Initial Supply - Additional 2B
        const mintAdditionalAmtBN = (new BigNumber("2000000000")).times(factor);

        // Should not mint more tokens than Max Supply
        await testErrorRevert(hypercycleToken.mint(accounts[0], mintAdditionalAmtBN, {from:accounts[8]}));

    });

    it("6. Burn Tokens Functionality", async function() 
    {
        // accounts[0] -> Contract Owner

        // burn the tokens from account[1]
        const burnAmountBN = new BigNumber("10000");
        await burnAndVerify(burnAmountBN.toString(), accounts[1]);

    });

    



});

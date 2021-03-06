const BigNumber = require('bignumber.js')

const SalesContract = artifacts.require("SalesContract");

contract('Error test for contract retraction', async (accounts) => {
    let instance
    const book = "book"
    var price
    const [seller, buyer, intermediator, randomGuy] = accounts


    beforeEach('Setup of contract', async function () {
        // Given
        instance = await SalesContract.new(buyer, intermediator)
        price = web3.utils.toBN((web3.utils.toWei('1', 'ether')))
    })

    /***********************************************************************************
     retractContract test without permission
    /**********************************************************************************/
   
    it("Retracted contract without permission", async () => {
        try {
            // When
            await instance.retractContract({from: randomGuy});
            assert.fail("retractContract from randomGuy should fail")            
        } catch (error) {
            // Then
            assert.ok(/revert/.test(error))
        }
    })

    /***********************************************************************************
     retractContract test while contract not intact
    /**********************************************************************************/
   
    it("Contract is not intact anymore, but user wants to retract", async () => {    
        // Given
        await instance.setItem(book, price)
        await instance.payItem({value: price, from: buyer})
        await instance.itemReceived({from: buyer})
        await instance.withdraw({from: seller})
        try {
            // When
            await instance.retractContract({ from: seller })
            assert.fail("retractContract from seller should fail")            
        } catch (error) {
            // Then
            let agreement = await instance.agreement();
            assert.strictEqual(agreement.sellerRetract, false, "Seller should not be marked as retracted")
            assert.ok(/revert/.test(error))
        }
    })

    /***********************************************************************************
     retractContract test, attempt by third participant to also retract
    /**********************************************************************************/
    
    it("Contract is retracted, but seller wants to retract also", async () => {    
        // Given
        await instance.setItem(book, price)
        await instance.payItem({value: price, from: buyer})
        await instance.retractContract({from: buyer})
        await instance.finalizeRetraction(true, {from: intermediator})
        try {
            // When
            await instance.retractContract({from: seller})
            assert.fail("retractContract from seller should fail")            
        } catch (error) {
            // Then
            let agreement = await instance.agreement();
            assert.strictEqual(agreement.buyerRetract, true, "Buyer should be marked as retracted")
            assert.strictEqual(agreement.sellerRetract, false, "Seller should not be marked as retracted")
            assert.strictEqual(agreement.intermediatorRetract, true, "Intermediator should be marked as retracted")
            assert.ok(/revert/.test(error))
        }
    })

    it("Contract is retracted, but buyer wants to retract also", async () => {    
        // Given
        await instance.setItem(book, price)
        await instance.payItem({value: price, from: buyer})
        await instance.retractContract({from: seller})
        await instance.finalizeRetraction( false, {from: intermediator})
        try {
            // When
            await instance.retractContract({from: buyer})
            assert.fail("retractContract from buyer should fail")            
        } catch (error) {
            // Then
            let agreement = await instance.agreement();
            assert.strictEqual(agreement.buyerRetract, false, "Buyer should not be marked as retracted")
            assert.strictEqual(agreement.sellerRetract, true, "Seller should be marked as retracted")
            assert.strictEqual(agreement.intermediatorRetract, true, "Intermediator should be marked as retracted")
            assert.ok(/revert/.test(error))
        }
    })

    /***********************************************************************************
     finalizeRetraction test
    /**********************************************************************************/
    
    it("Finalize Retraction by buyer should fail", async () => {    
        await instance.retractContract({from: buyer})
        try {
            // When
            await instance.finalizeRetraction(true, {from: buyer})
            assert.fail("finalizeRetraction from buyer should fail")            
        } catch (error) {
            // Then
            assert.ok(/revert/.test(error))
        }
    }) 

    it("Finalize Retraction by seller should fail", async () => {    
        await instance.retractContract({from: seller})
        try {
            // When
            await instance.finalizeRetraction(false, {from: seller})
            assert.fail("finalizeRetraction from seller should fail")            
        } catch (error) {
            // Then
            assert.ok(/revert/.test(error))
        }
    })

    it("Contract is retracted, but intermediator calls finalize again", async () => {    
        // Given
        await instance.setItem(book, price)
        await instance.payItem({value: price, from: buyer})
        await instance.retractContract({from: seller})
        await instance.finalizeRetraction( false, {from: intermediator})
        try {
            // When
            await instance.finalizeRetraction(true, {from: intermediator})
            assert.fail("finalizeRetraction from intermediator should fail")            
        } catch (error) {
            // Then
            assert.ok(/revert/.test(error))
        }
    })

    it("Contract is not intact, but intermediator calls finalize", async () => {    
        // Given
        await instance.setItem(book, price)
        await instance.payItem({value: price, from: buyer})
        await instance.itemReceived({from: buyer})
        await instance.withdraw({from: seller})
        try {
            // When
            await instance.finalizeRetraction(true, {from: intermediator})
            assert.fail("finalizeRetraction from intermediator should fail")            
        } catch (error) {
            // Then
            assert.ok(/revert/.test(error))
        }
    })

    it("Contract is not marked as retracted by buyer or seller, but intermediator calls finalize", async () => {    
        // Given
        await instance.setItem(book, price)
        await instance.payItem({value: price, from: buyer})
        try {
            // When
            await instance.finalizeRetraction(true, {from: intermediator})
            assert.fail("finalizeRetraction from intermediator should fail")            
        } catch (error) {
            // Then
            assert.ok(/revert/.test(error))
        }
    })
})
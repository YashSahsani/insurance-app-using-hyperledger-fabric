/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { Shim } = require('fabric-shim');
const perfixUser='preu',perfixContract='prec', prefixRepairOrder='preRO',prefixContractType = 'preCT',perfixClaim='preCL';

class MyAssetContract extends Contract {

    async CheckUserExist(ctx, username) {
        const buffer = await ctx.stub.getState(username);
        return (!!buffer && buffer.length > 0);
    }
    async createContract(ctx,uuid,contractTypeUUID,username,password,fname,lname,startdate,enddate){
        let userKey = ctx.stub.createCompositeKey(perfixUser,[username]);
        let UserExist = await this.CheckUserExist(ctx,userKey);
        Shim.success(userKey);
        if (!UserExist){
           let res =  await this.createUser(ctx,username,password,fname,lname,userKey);
           Shim.success(res);
           
        }
        const contract = { uuid,contractTypeUUID,startdate,enddate,"void":false,"claimIndex":[]};
        const buffer = Buffer.from(JSON.stringify(contract));
        let ContractKey = ctx.stub.createCompositeKey(perfixContract,[username,uuid]);
        await ctx.stub.putState(ContractKey, buffer);
        return contract;
        

    }
    async createUser(ctx, username,password,fname,lname,userKey){
           var user = {username,fname,lname,password};
           const buffer = Buffer.from(JSON.stringify(user));
           await ctx.stub.putState(userKey, buffer);
           return user;
    }
    async listContractTypes(ctx,shop_type){
        const iterator = await ctx.stub.getStateByPartialCompositeKey(prefixContractType, []);

        let allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));

                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                
                  

                    if(Record.active == "true" && Record.shopType == shop_type){
                        allResults.push({
                            Key,
                            Record
                        });
                    }
                
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }

    }

    async listContract(ctx,username){
        let filterByUsername  = username.length;
        let resultsIterator;
        let allResults = [];
        if(filterByUsername){
             resultsIterator = await ctx.stub.getStateByPartialCompositeKey(perfixContract,[username]);
        }else{
             resultsIterator = await ctx.stub.getStateByPartialCompositeKey(perfixContract,[]);
        }
        while (true) {
            const res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record,claim;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));

                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                if(username.length != 0 && Record.claimIndex.length != 0){
                    let claimBytes = await ctx.stub.getState(Record.claimIndex);
                     claim = JSON.parse(claimBytes.toString());
                    
                }
                else{
                     claim = "NIL";
                }
                allResults.push({
                    Key,
                    Record,
                    claim
                });
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
       
    }
    async listRepairOrders(ctx){
        
        const iterator = await ctx.stub.getStateByPartialCompositeKey(prefixRepairOrder, []);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));

                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({
                    Key,
                    Record
                });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async completeRepairOrder(ctx,uuid){
        let repairOrderKey = await ctx.stub.createCompositeKey(prefixRepairOrder,[uuid]);
        let repairOrderBytes = await ctx.stub.getState(repairOrderKey);
        if(repairOrderBytes.length == 0){
            throw new Error("Repair Order doesn't exist");
        }
        var  repairOrder  = JSON.parse(repairOrderBytes.toString());
        repairOrder['Ready'] == true;// changes are required in list repair function if ready and than skip 
        repairOrderBytes =  Buffer.from(JSON.stringify(repairOrder));
        await ctx.stub.putState(repairOrderKey,repairOrderBytes);

        let ClaimKey = await ctx.stub.createCompositeKey(prefixClaim, [repairOrder.ContractUUID ,repairOrder.ClaimUUID]);
        let Claimbytes = await ctx.stub.getState(ClaimKey);
        if(Claimbytes.length != 0){
            let Claim = await JSON.parse(Claimbytes.toString());
            Claim['Repair'] = true;
            Claimbytes = Buffer.from(JSON.stringify(Claim));
            await ctx.stub.putState(ClaimKey,Claimbytes);
        }


    }
    async fileClaim(ctx,username,uuid,contract_uuid,date,description,is_theft){
        let status = 'ClaimStatusNew';
        let claim = {contract_uuid,date,description,is_theft,status};
        let claimKey = await ctx.stub.createCompositeKey(perfixClaim,[contract_uuid,uuid]);
        let claimbytes =  Buffer.from(JSON.stringify(claim));
        await ctx.stub.putState(claimKey,claimbytes);
        let ContractKey = await ctx.stub.createCompositeKey(perfixContract,[username,uuid]);
        let ContractdataByte = await ctx.stub.getState(ContractKey);
        let allResults = await JSON.parse(ContractdataByte.toString());
        allResults['claimIndex'] = claimKey;
        let  buffer = Buffer.from(JSON.stringify(allResults));
        await ctx.stub.putState(ContractKey,buffer);
        return allResults;
        
    }

    async processClaim(ctx, uuid, username, Contractuuid, status, reimbursable){
        const input = { uuid, Contractuuid, status, reimbursable };
        let claimKey =  await ctx.stub.createCompositeKey(perfixClaim, [input.Contractuuid, input.uuid]);
        let claimBytes = await ctx.stub.getState(claimKey);
        let claim = JSON.parse(claimBytes.toString());
        
        if(!claim.is_theft && claim.status != "ClaimStatusNew"){
            throw new Error("Cannot change the status of a non-new claim.");
        }
        if(claim.is_theft && claim.Status == "ClaimStatusNew"){
            throw new Error("Theft must first be confirmed by authorities.");
        }
        claim.status = input.status;
        let ContractKey = await ctx.stub.createCompositeKey(perfixContract,[username,uuid])
        var buffer = await ctx.stub.getState(ContractKey);
        const contract = JSON.parse(buffer.toString());
        switch(input.status){
            case "ClaimStatusRepair":
                if(claim.isTheft){
                    throw Error("Cannot repair stolen items.");
                }
                claim.Reimbursable = 0;
                contractItem = contract.item;
                inputUUID = input.uuid
                inputContractUUID = input.Contractuuid
                const repairOrder = { contractItem, inputUUID, inputContractUUID, "ready":false };
                repairOrderKey = ctx.stub.createCompositeKey(prefixRepairOrder, [input.uuid]);
                buffer = Buffer.from(JSON.stringify(repairOrder));
                await ctx.stub.putState(repairOrderKey, buffer);
                break;

            case "ClaimStatusReimbursement":
                claim.reimbursable = input.reimbursable;
                if(claim.isTheft){
                    contract.void = true;
                    var newContractKey = ctx.stub.createCompositeKey(prefixContract, [contract.username, claim.Contractuuid]);
                    buffer = Buffer.from(JSON.stringify(contract));
                    await ctx.stub.putState(newContractKey, buffer);
                }
                break;

            case "ClaimStatusRejected":
                claim.Reimbursable = 0;
                break;

            default:
                throw Error("Unknown status change.");

        }
    }

    async listClaims(ctx,status){
        const iterator = await ctx.stub.getStateByPartialCompositeKey(perfixClaim, []);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));

                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }

                if(Record.status != status && status != "ClaimStatusUnknown"){
                    continue;
                }
                let keys = ctx.stub.splitCompositeKey(Key);
                
                if(keys.length < 2){
                    Record.uuid = keys[0];
                }else{
                    Record.uuid = keys[1];
                }
                allResults.push({
                    Key,
                    Record
                });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
    async authUser(ctx,username,password){
        let userkey = await ctx.stub.createCompositeKey(perfixUser,[username]);
        let userExist = await this.CheckUserExist(ctx,userkey);
        if(userExist){
        let userbyte = await ctx.stub.getState(userkey);
        let userinfo = await JSON.parse(userbyte.toString());
        if(password === userinfo.password){
            return true;
        }else{
            return false;
        }
    }
    else{
        throw new Error(`Invalid username or user doesn't exist`);
        
    }
    }
    
    async  setActiveContractType(ctx,uuid,active){
        let contractKey = await ctx.stub.createCompositeKey(prefixContractType,[uuid]);
        let contracttypebytes =await ctx.stub.getState(contractKey);
        if(contracttypebytes.length == 0){
            throw new Error('can\'t find contract type');
        }
        let contractType = await JSON.parse(contracttypebytes.toString());
        contractType['active'] = active;
        let buffer = Buffer.from(JSON.stringify(contractType))
        await ctx.stub.putState(contractKey,buffer);
        return contractType;

    }    
    async createContractType(ctx,uuid,Contractuuid,shopType,formulaPerDay,maxSumInsured,theftInsured,description,conditions,minDurationDays ,maxDurationDays)
    {
        let contractTypeValue = {Contractuuid,shopType,formulaPerDay,maxSumInsured,theftInsured,description,conditions,minDurationDays ,maxDurationDays};
    
        let contractTypeKey = await ctx.stub.createCompositeKey(prefixContractType,[uuid]);
        let buffer = Buffer.from(JSON.stringify(contractTypeValue));
        await ctx.stub.putState(contractTypeKey,buffer);
        return contractTypeValue;
    }
    
    

    async processTheftClaim(ctx,contractUUID,uuid,file_refrence,IsTheft){
        let key = await ctx.stub.createCompositeKey(perfixClaim,[contractUUID,uuid]);
        let claimAsBytes = await ctx.stub.getState(key);
        let claim = JSON.parse(claimAsBytes.toString());
        if(!claim.is_theft || claim.status != 'ClaimStatusNew'){
            throw new Error("Claim is either not related to theft, or has invalid status.");

        }
        
        if(IsTheft){

            claim['Status'] = 'ClaimStatusTheftConfirmed';
        }else{
            claim['Status'] = 'ClaimStatusRejected';
        }
        claim['FileReference'] = file_refrence;

        claimAsBytes = Buffer.from(JSON.stringify(claim));

        await ctx.stub.putState(key,claimAsBytes);
    }
}

module.exports = MyAssetContract;

/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { Shim } = require('fabric-shim');
const perfixUser='preu',perfixContract='prec', prefixRepairOrder='preRO',prefixContractType = 'preCT',perfixClaim='preCL';
const  {Enum} = require('enum');
const ClaimStatus = new Enum({'ClaimStatusUnknown':0,'ClaimStatusNew':1,'ClaimStatusRejected':2,'ClaimStatusRepair':3,'ClaimStatusReimbursement':4,'ClaimStatusTheftConfirmed':5});
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
        repairOrderBytes = await Buffer.from(JSON.stringify(repairOrder));
        await ctx.stub.putState(repairOrderKey,repairOrderBytes);

        let ClaimKey = await ctx.stub.createCompositeKey(prefixClaim, [repairOrder.ContractUUID ,repairOrder.ClaimUUID]);
        let Claimbytes = await ctx.stub.getState(ClaimKey);
        if(Claimbytes.length != 0){
            let Claim = await JSON.parse(Claimbytes.toString());
            Claim['Repair'] = true;
            Claimbytes = await Buffer.from(JSON.stringify(Claim));
            await ctx.stub.putState(ClaimKey,Claimbytes);
        }


    }
    async fileClaim(ctx,uuid,contract_uuid,date,description,is_theft){
        let status = ClaimStatus.get(1).value;
        let allResults = [];
        claim = {contract_uuid,date,description,is_theft,status};
        let iterator = await ctx.stub.getStateByPartialCompositeKey(perfixContract,[]);
        while (true) {
            const res = await iterator.next();
            const Key = res.value.key;
            let splitk = await ctx.stub.splitCompositeKey(Key);
            if(splitk[1] == uuid){
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
            break;
            }
        }
        let claimKey = await ctx.stub.CreateCompositeKey(perfixClaim,[contract_uuid,uuid]);
        let claimbytes = await Buffer.from(JSON.stringify(claimKey));
        await ctx.stub.putState(claimKey,claimbytes);
        allResults['ClaimIndex'] = claimKey;
        let contractKey = await ctx.stub.createCompositeKey(perfixContract,[allResults['username'],uuid]);
        let  buffer = Buffer.from(JSON.stringify(allResults));
        await ctx.stub.putState(contractKey,buffer);
        return allResults;


    }
    async processClaim(ctx, uuid, username, Contractuuid, date, description, isTheft, status, reimbursable, repaired, fileReference){
        const input = { uuid, Contractuuid, status, reimbursable };
        const claim = { Contractuuid, date, description, isTheft, status, reimbursable, repaired, fileReference };
        let claimKey = ctx.stub.createCompositeKey(prefixClaim, [input.Contractuuid, input.uuid]);

        if(!claim.IsTheft && claim.Status != "ClaimStatusNew"){
            throw Error("Cannot change the status of a non-new claim.");
        }
        if(claim.IsTheft && claim.Status == "ClaimStatusNew"){
            throw Error("Theft must first be confirmed by authorities.");
        }
        claim.status = input.status;

        let ContractKey = ctx.stub.createCompositeKey(perfixContract,[username,uuid])
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
    async createContractType(ctx,uuid,dict){
        let contractTypeValue = dict;
        if(contractTypeValue.length != 9){
            throw new Error('Argument given are incorrect');
        }
        let contractTypeKey = await ctx.stub.CreateCompositeKey(prefixContractType,[uuid]);
        let buffer = Buffer.from(JSON.stringify(contractTypeValue));
        await ctx.stub.putState(contractTypeKey,buffer);
        return contractTypeValue;
    }
    
    async processTheftClaim(ctx,uuid,contractUUID,IsTheft,file_refrence){


        let key = await ctx.stub.CreateCompositeKey(perfixClaim,[contractUUID,uuid]);
        let claimAsBytes = await ctx.stub.getState(key);
        let claim = JSON.parse(claimAsBytes.toString());

        if(!claim.IsTheft || claim.Status != ClaimStatus.get(1).key){
            throw new Error("Claim is either not related to theft, or has invalid status.");

        }
        
        if(IsTheft){
            claim['Status'] = ClaimStatus.get(5).key;
        }else{
            claim['Status'] = ClaimStatus.get(4).key;
        }
        claim['FileReference'] = file_refrence;

        claimAsBytes = Buffer.from(JSON.stringify(claim));

        await ctx.stub.putState(key,claimAsBytes);

    }
}

module.exports = MyAssetContract;

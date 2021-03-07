'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const path = require('path');
const { Wallets ,Gateway, BlockListener,ListenerOptions,User} = require('fabric-network');
//const PubNub = require('pubnub')
const FabricCAServices = require('fabric-ca-client');

var gateway;
var configdata;
var network;
var bLocalHost;
var ccp_pro;
var ccp_act;
var ccp_cou;
var ccp_wri;
var orgMSPID;

var contract = null;

const utils = {};

utils.connectGatewayFromConfig = async () => {
    console.log("*********************** connectGatewayFromConfig function: ********************* ");

const configPath =  '../gateway/config.json';
const configJSON = fs.readFileSync(configPath, 'utf8');
configdata = JSON.parse(configJSON);

// connect to the connection file
const PccpPath = '../gateway/ibpConnection_producer.json';
const PccpJSON = fs.readFileSync(PccpPath, 'utf8');
ccp_pro = JSON.parse(PccpJSON);
const AccpPath = '../gateway/ibpConnection_actor.json';
const AccpJSON = fs.readFileSync(AccpPath, 'utf8');
ccp_act = JSON.parse(AccpJSON);
const WccpPath = '../gateway/ibpConnection_writer.json';
const WccpJSON = fs.readFileSync(WccpPath, 'utf8');
ccp_wri = JSON.parse(WccpJSON);
const CccpPath = '../gateway/ibpConnection_country.json';
const CccpJSON = fs.readFileSync(CccpPath, 'utf8');
ccp_cou = JSON.parse(CccpJSON);


// A wallet stores a collection of identities for use
const walletPath = path.join(process.cwd(), '/wallet');
const wallet =  await Wallets.newFileSystemWallet(walletPath);

    const peerIdentity = 'ProducerAppAdmin';

    // A gateway defines the peers used to access Fabric networks
    gateway = new Gateway();

     try {

    let response;

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.get(peerIdentity);
    if (!userExists) {
      console.log('An identity for the user ' + peerIdentity + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      response.error = 'An identity for the user ' + peerIdentity + ' does not exist in the wallet. Register ' + peerIdentity + ' first';
      return response;
    }
    //connect to Fabric Network, but starting a new gateway
    const gateway = new Gateway();
     orgMSPID = ccp_pro.client.organization;
     console.log('MSP ID: ' + orgMSPID);
    //use our config file, our peerIdentity, and our discovery options to connect to Fabric network.
    await gateway.connect(ccp_pro, { wallet, identity: peerIdentity, discovery: configdata.gatewayDiscovery });
    //connect to our channel that has been created on IBM yash/Internship_projects Platform
    const network = await gateway.getNetwork('mychannel');
    //connect to our insurance contract that has been installed / instantiated on IBM yash/Internship_projects Platform
     contract = await network.getContract('Mediaproject'); 
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }finally{
return contract;
}

}





utils.registerUser = async (userid, userpwd, usertype,countryname) => {
    console.log("\n------------  function registerUser ---------------");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype: " + usertype)
    let id ;
    let ccp;
    const walletPath = path.join(process.cwd(), '/wallet');
const wallet =  await Wallets.newFileSystemWallet(walletPath);

    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
    
    var newUserDetails;
    if( usertype == "Country"){
     newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
                
            },{
                "name":  "countryname",
                "value": countryname,
                "ecert": true
            }],
        maxEnrollments: 5
    };}
    else{
        newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
        maxEnrollments: 5
    };
   

    }
    console.log(id);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: id, discovery: configdata.gatewayDiscovery });
        console.log("Connected");
        // Get the CA client object from the gateway for interacting with the CA.
        //const ca = gateway.getClient().getCertificateAuthority();
        console.log('Getting CA');
    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    orgMSPID = ccp.client.organization;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
        const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });
        let adminIdentity = await wallet.get(id);
           // build a user object for authenticating with the CA
         const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');
      

        // Register the user, enroll the user, and import the new identity into the wallet.
        //const secret = await ca.register({  enrollmentID: userName, role: 'client'}, adminIdentity);
    await ca.register(newUserDetails, adminUser)
        .then(newPwd => {
            console.log("\n---------------------------------------------------");
            console.log('\n Secret returned: ' + newPwd);
            console.log("\n---------------------------------------------------");

            return newPwd;
        }, error => {
            console.log("\n----------------------------------------");
            console.log('Error in register();  ERROR returned: ' + error);
            console.log("\n----------------------------------------");
            return error;
        });
}  

utils.enrollUser = async (userid, userpwd, usertype,countryname) => {
    let ccp;
    let id;
    const walletPath = path.join(process.cwd(), '/wallet');
const wallet =  await Wallets.newFileSystemWallet(walletPath);

    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
    console.log("\n------------  function enrollUser -----------------");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype:" + usertype);

    // get certification authority
    console.log('Getting CA');
    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    orgMSPID = ccp.client.organization;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });
 var newUserDetails;
    if( usertype == "Country"){
     newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
                
            },{
                "name":  "countryname",
                "value": countryname,
                "ecert": true
            }],
    };}
    else{
        newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
    };

    }
    console.log("User Details: " + JSON.stringify(newUserDetails))
    return ca.enroll(newUserDetails).then(enrollment => {
        console.log("\n Successful enrollment; Data returned by enroll", enrollment.certificate);

        let x509Identity;
        if (usertype == "Country") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'BuyerMSP',
                type: 'X.509',
            };
        } else if (usertype == "Producer") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'ProducerMSP',
                type: 'X.509',
            };
        }
        else if (usertype == "Writer") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'WriterMSP',
                type: 'X.509',
            };
        }
        else if (usertype == "Actor") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'ActorMSP',
                type: 'X.509',
            };
        }
        wallet.put(userid, x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return
    }, error => {
        console.log("Error in enrollment " + error.toString());
        throw error;
    });
}

utils.isUserEnrolled = async (userid) => {
    const walletPath = path.join(process.cwd(), '/wallet');
const wallet =  await Wallets.newFileSystemWallet(walletPath);

    console.log("\n---------------  function isUserEnrolled ------------------------------------");
    console.log("\n userid: " + userid);
    console.log("\n---------------------------------------------------");

    return wallet.get(userid).then(result => {
        console.log("is User Enrolled: yes");
        console.log("\n---------------  end of function isUserEnrolled ------------------------------------");
        return result;
    }, error => {
        console.log("error in wallet.get\n" + error);
        throw error;
    });
}

utils.getAllUsers = async (usertype) => {
    let id ;
    let ccp;
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: id, discovery: configdata.gatewayDiscovery });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = gateway.getCurrentIdentity();
    let userList = await idService.getAll(user);
    let identities = userList.result.identities;
    let result = [];
    let tmp;
    let attributes;

    // for all identities
    for (var i = 0; i < identities.length; i++) {
        tmp = {};
        tmp.id = identities[i].id;
        tmp.usertype = "";

        if (tmp.id == "admin")
            tmp.usertype = tmp.id;
        else {
            attributes = identities[i].attrs;
            // look through all attributes for one called "usertype"
            for (var j = 0; j < attributes.length; j++)
                if (attributes[j].name == "usertype") {
                    tmp.usertype = attributes[j].value;
                    break;
                }
        }
        result.push(tmp);
    }
    //console.log(result);
    return result;
} //  end of function getAllUsers

utils.setUserContext = async (userid, pwd,usertype) => {
    const walletPath = path.join(process.cwd(), '/wallet');
const wallet =  await Wallets.newFileSystemWallet(walletPath);

    console.log('In function: setUserContext ....');

    // It is possible that the user has been registered and enrolled in Fabric CA earlier
    // and the certificates (in the wallet) could have been removed.  
    // Note that this case is not handled here.

    // Verify if user is already enrolled
    console.log(usertype);
    const userExists = await wallet.get(userid);
    if (!userExists) {
        console.log("An identity for the user: " + userid + " does not exist in the wallet");
        console.log('Enroll user before retrying');
        throw ("Identity does not exist for userid: " + userid);
    }

    try {
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway with userid:' + userid);
        let id ;
        let ccp;
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        let userGateway = new Gateway();
        await userGateway.connect(ccp, { identity: userid, wallet: wallet, discovery: configdata.gatewayDiscovery });

        // Access channel: channel_name
        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userid + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);

        console.log('Leaving setUserContext: ' + userid);
        return contract;
    }
    catch (error) { throw (error); }
}  //  end of UserContext(userid)

utils.createAsset = async function(userName,usertype,assetid, owner ,assetname , advancevalue,actorname,writername) {
     let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
      try{  console.log('we here in createAsset')

        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);

        await contract.submitTransaction('createMyAsset', assetid ,assetname, advancevalue,owner,actorname,writername);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await userGateway.disconnect();
        return "Transaction completed";

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response; 
    }
}

utils.BuyAsset = async function(userName,usertype,assetid,forhowmuchtime,forhowmuchep) {

    try {
         let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.submitTransaction('BuyAsset',assetid,forhowmuchep,forhowmuchtime);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        return result.toString();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

utils.AckAdvancePayment = async function(userName,usertype,assetid,countryname){
    try{
         let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
        configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        const result = await contract.submitTransaction('AcknowledgementofadvancePaymentreceived', assetid,countryname);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result.toString();

    }catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;

    }

}
utils.AdvancePayment = async function(userName,usertype,assetid){
    try{
         let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
        configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);

        const result = await contract.submitTransaction('advance_paytment', assetid);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result.toString();

    }catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;

    }

}


utils.playep = async function(userName,usertype,assetid){
    try{
         let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
        configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);

        const result = await contract.submitTransaction('playep', assetid);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result.toString();

    }catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;

    }

}

utils.SeeAllAssets = async function(userName,usertype) {

    try {
        const walletPath = path.join(process.cwd(), '/wallet');
const wallet =  await Wallets.newFileSystemWallet(walletPath);

        let id ;
        let ccp;
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.evaluateTransaction('SeeAllAssets');

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}
utils.SeeAllRoyalty = async function(userName,usertype) {
    let functionname;
    try {
        let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
        functionname = "WriCalucateRoyalty";
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
        functionname = "ActCalucateRoyalty";
    }
    else{
        return "Invalid Type";
    }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.evaluateTransaction(functionname);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

utils.SeeAll = async function(userName,usertype) {

    try {
        let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else if(usertype == "Admin"){
        id = "Admin";
        ccp= ccp_pro;
    }
    else{
        return "Invalid Type";
    }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: "sneha", discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.evaluateTransaction('SeeAll');

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}
utils.SeeAllNotPaid = async function(userName,usertype) {

    try {
        let id ;
        let ccp;
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(usertype);
    if(usertype == "Country"){
        id = configdata.CountryappAdmin;
        ccp = ccp_cou;
    }
    else if(usertype == "Producer"){
        id = configdata.ProducerappAdmin;
        ccp = ccp_pro;
    }
    else if(usertype == "Writer"){
        id = configdata.WriterappAdmin;
        ccp = ccp_wri;
    }
    else if(usertype == "Actor"){
        id = configdata.ActorappAdmin;
        ccp = ccp_act;
    }
    else{
        return "Invalid Type";
    }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.evaluateTransaction('Paid_advance');

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

module.exports = utils;

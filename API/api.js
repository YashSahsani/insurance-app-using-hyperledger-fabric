'use strict';

// Classes for Node Express
const express = require('express');
const app = express();
const cors = require('cors');
const SUCCESS = 0;
const TRANSACTION_ERROR = 401;
const USER_NOT_ENROLLED = 402;
const jwt = require('jsonwebtoken');
//  connectionOptions
const utils = require('./ibputils.js');
var contract;
var username;




utils.connectGatewayFromConfig().then((gateway_contract) => {

    console.log('Connected to Network.');
    contract = gateway_contract;

    //  Setup events and monitor for events from HLFabric
   // utils.events();

}).catch((e) => {
    console.log('Connection exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});

app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});

app.use(cors());

function verifyToken(req, res, next) {
    // Get auth header value
    console.log(req.headers['authorization']);
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      
      req.token = bearerToken;
      // Next middleware
      console.log(req.token);
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
  }

  app.post('/api/login', (req, res) => {
    // Mock user
    console.log(req.body);
    let password = req.body.password;
    console.log(password);
    if(password!="DuBaraMatPuchna"){
        res.sendStatus(403);
    }else{
    const user = {
      id: 1, 
      username: 'admin',
      email: 'admin@devfolio.com',
      pass:"DuBaraMatPuchna"
    }
  
    jwt.sign({user}, 'Hackbash', { expiresIn: '60s' }, (err, token) => {
      res.json({
        token
      });
    });
}
  });
app.post('/api/CreateContract', verifyToken, (req, res) => {
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
    
    console.log("\n--------------  api/createContract --------------------------");
    let uuid = req.body.uuid;
    let contractuuid = req.body.contractuuid;
    let username = req.body.username;
    let password = req.body.password
    let sdate = req.body.sdate;
    let ldate = req.body.ldate;
    let fname = req.body.fname;
    let lname = req.body.lname;
    console.log("\n---------------------------------------------------");
    console.log(uuid);
    console.log(contractuuid);
    console.log(username);
    console.log(password);
    console.log(sdate);
    console.log(ldate);
    console.log(fname);
    console.log(lname);
    utils.CreateContract(uuid,contractuuid,username,password,fname,lname,sdate,ldate)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
    //console.log("Username:"+username);
}});
    
});

app.get('/api/GetContractList',(req,res) =>{
let username = req.query.username;
console.log("=================");
console.log(username);
utils.GetlistOfContract(username)
    .then(result =>{
        res.json(result)
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })


});
app.get('/api/GetContractListType',(req,res) =>{
    let shop_type = req.query.shop_type;
    console.log("=================");
    console.log(username);
    utils.GetlistOfTypeContract(shop_type)
        .then(result =>{
            res.json(result)
        }, (error) => {
            //  handle error if transaction failed
            error.errorCode = 404;
            console.log('Error thrown from tx promise: ', error);
            res.json(error);
        })
    
    
    });

    app.get('/api/GetlistOfRepairOrders',(req,res) =>{
        let username = req.query.username;
        console.log("=================");
        console.log(username);
        utils.GetlistOfRepairOrders()
            .then(result =>{
                res.json(result)
            }, (error) => {
                //  handle error if transaction failed
                error.errorCode = 404;
                console.log('Error thrown from tx promise: ', error);
                res.json(error);
            })
        
        
        });
app.get('/api/GetlistClaims',(req,res) =>{
            let username = req.query.username;
            console.log("=================");
            console.log(username);
            utils.GetlistClaims()
                .then(result =>{
                    res.json(result)
                }, (error) => {
                    //  handle error if transaction failed
                    error.errorCode = 404;
                    console.log('Error thrown from tx promise: ', error);
                    res.json(error);
                })
            
            
});
            

app.post('/api/AuthUser',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let username  = req.body.username;
let  password = req.body.password;


utils.AuthUser(username,password)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});
app.post('/api/ProcessTheftClaim',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let uuid  = req.body.uuid;
let  contractUUID = req.body.Contractuuid;
let IsTheft  = req.body.IsTheft;
let  file_refrence = req.body.file_refrence;


utils.ProcessTheftClaim(uuid,contractUUID,IsTheft,file_refrence)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});
app.post('/api/CreateContractType',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let uuid  = req.body.uuid;
let  Contractuuid = req.body.Contractuuid;
let shopType = req.body.shopType;

let formulaPerDay  = req.body.formulaPerDay;
let  maxSumInsured = req.body.maxSumInsured;
let theftInsured = req.body.theftInsured;
let description  = req.body.description;
let  conditions = req.body.conditions;
let minDurationDays = req.body.minDurationDays;
let maxDurationDays = req.body.maxDurationDays;


utils.CreateContractType(uuid,Contractuuid,shopType,formulaPerDay,maxSumInsured,theftInsured,description,conditions,minDurationDays ,maxDurationDays)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});
app.post('/api/SetActiveContractType',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let uuid  = req.body.uuid;
let  active = req.body.active;
console.log(uuid);
console.log(active);


utils.SetActiveContractType(uuid,active)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});


app.post('/api/ProcessClaim',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let uuid  = req.body.uuid;
let  username = req.body.username;
let Contractuuid  = req.body.Contractuuid;
let status  = req.body.status;
let  reimbursable = req.body.reimbursable;
utils.ProcessClaim(uuid, username, Contractuuid, status, reimbursable)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});

app.post('/api/FileClaim',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let username = req.body.username;
let uuid  = req.body.uuid;
let Contractuuid  = req.body.Contractuuid;
let  date = req.body.date;
let description  = req.body.description;
let  isTheft = req.body.isTheft;

utils.FileClaim(username,uuid,Contractuuid,date,description,isTheft)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});

app.post('/api/CompletRepairOrder',verifyToken, (req,res) =>{
    jwt.verify(req.token, 'Hackbash', (err) => {
        if(err) {
          res.sendStatus(403);
        }else{
let uuid  = req.body.uuid;


utils.CompletRepairOrder(uuid)
    .then(result =>{
        res.json({'errorCode':result})
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 404;
        console.log('Error thrown from tx promise: ', error);
        res.json(error);
    })
}});
});

app.get('/api/block',(req,res) =>{
        let bnum = req.query.num;
        console.log("=================");
        console.log(bnum);
        utils.BlockInfo(bnum)
            .then(result =>{
                res.json(result)
            }, (error) => {
                //  handle error if transaction failed
                error.errorCode = 404;
                console.log('Error thrown from tx promise: ', error);
                res.json(error);
            })
        
        });
app.get('/api/Getblockbytx',(req,res) =>{
            let txid = req.query.txid;
            console.log("=================");
            console.log(txid);
            utils.getTransactionByID(txid)
                .then(result =>{
                    res.json(result)
                }, (error) => {
                    //  handle error if transaction failed
                    error.errorCode = 404;
                    console.log('Error thrown from tx promise: ', error);
                    res.json(error);
                })
            
            });
const port = process.env.PORT || 3000;
app.listen(port, (error) => {
    if (error) {
        return console.log('Error: ' + err);
    }
    console.log(`Server listening on ${port}`)
});


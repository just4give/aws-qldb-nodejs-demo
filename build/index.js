const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const serverlessExpress = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AmazonQLDBDriverNodejs = require("amazon-qldb-driver-nodejs");
const AWS = require("aws-sdk");
AWS.config.update({region:'us-east-1'});
const qldb = new AWS.QLDB({apiVersion: '2019-01-02'});
const ionjs = require("ion-js");
const utils = require("./utils");

const qldbDriver = new AmazonQLDBDriverNodejs.PooledQldbDriver("DealLedger", {region: "us-east-1"});
const app = express();
const router = express.Router();

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(awsServerlessExpressMiddleware.eventContext())

app.use('/api/', router);

const server = serverlessExpress.createServer(app);

exports.handler = (event, context) => {

    console.log("inside lambda handler",JSON.stringify(event,null,2));
    serverlessExpress.proxy(server, event, context);

}

router.get('/health',async (req,res)=>{
    
    res.json({status:'UP'});
})

router.get('/get-block',async (req,res)=>{
    let r = await qldb.getBlock({
        BlockAddress: { /* required */
            IonText: '{strandId:"BfvSL5DYUKE3spPDrWewCC",sequenceNo:4}'
          },
          Name: 'DealLedger', /* required */
          DigestTipAddress: {
            IonText: '{strandId:"BfvSL5DYUKE3spPDrWewCC",sequenceNo:135}'
          }
    }).promise();
    res.json(r);
})

router.get('/ledger/:tablename',async (req,res)=>{
    let tablename = req.params.tablename;
    const writer = ionjs.makeTextWriter();
    const qldbSession = await qldbDriver.getSession();

    let r = await (await qldbSession.executeStatement(`Select * from _ql_committed_${tablename} as v`)).getResultList();
    
    let json =[];
    r.forEach(reader=>{
        reader.next();
        let obj = utils.recursivePathLookup(reader,[]);
        obj.blockAddress.sequenceNo = parseInt( obj.blockAddress.sequenceNo.join(''));
        json.push({data: obj.data, blockAddress: obj.blockAddress,metadata:obj.metadata});
    })
 
    res.json(json);
})

router.get('/history/:tablename/:id',async (req,res)=>{
    let tablename = req.params.tablename;
    let id = req.params.id;
    const writer = ionjs.makeTextWriter();
    const qldbSession = await qldbDriver.getSession();

    let r = await (await qldbSession.executeStatement(`Select * from history(${tablename}) as h where h.metadata.id='${id}'`)).getResultList();
    
    let json =[];
    r.forEach(reader=>{
        reader.next();
        let obj = utils.recursivePathLookup(reader,[]);
        obj.blockAddress.sequenceNo = parseInt( obj.blockAddress.sequenceNo.join(''));
        json.push({data: obj.data, blockAddress: obj.blockAddress,metadata:obj.metadata});
    })
 
    res.json(json);
})

router.post('/verification',async (req,res)=>{
    let body = req.body;
    
    let revision = await qldb.getRevision({
        BlockAddress: { /* required */
          IonText: JSON.stringify(body.blockAddress)
        },
        DocumentId: body.metadata.id, /* required */
        Name: 'DealLedger', /* required */
        DigestTipAddress: {
          IonText: body.digest.DigestTipAddress.IonText
        }
      }).promise()
 
    res.json(revision);
})

router.get('/digest',async (req,res)=>{
    
    let r  = await qldb.getDigest({Name:'DealLedger'}).promise();

    res.json(r);
})

router.put('/update-status',async (req,res)=>{
    let body = req.body;
    const qldbSession = await qldbDriver.getSession();
    
    const dealIdQldbWriter = AmazonQLDBDriverNodejs.createQldbWriter();
    utils.writeValueAsIon(body.dealId, dealIdQldbWriter);

    const statusQldbWriter = AmazonQLDBDriverNodejs.createQldbWriter();
    utils.writeValueAsIon(body.status, statusQldbWriter);

    const statement = "UPDATE Deal as v set v.status=? where v.dealId=?";
    let r = await (await qldbSession.executeStatement(statement,[statusQldbWriter,dealIdQldbWriter])).getResultList();
    
    res.json({success:true});
})
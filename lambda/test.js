const AmazonQLDBDriverNodejs = require("amazon-qldb-driver-nodejs");
const AWS = require("aws-sdk");
AWS.config.update({region:'us-east-1'});
const qldb = new AWS.QLDB({apiVersion: '2019-01-02'});

const ionjs = require("ion-js");
const utils = require("./utils");

const qldbDriver = new AmazonQLDBDriverNodejs.PooledQldbDriver("DealLedger", {region: "us-east-1"});

var main = async function(){
    console.log("calling main ");
    
    const qldbSession = await qldbDriver.getSession();
    for (const table of await qldbSession.getTableNames()) {
        console.log(table);
    }
    let r = await (await qldbSession.executeStatement("Select * from _ql_committed_Deal as v")).getResultList();
    
    //console.log(r);
    let json = [];
    r.forEach(reader=>{
        // let writer = ionjs.makeTextWriter();
        // //console.log(reader);
        // writer.writeValues(reader);
        // let s = ionjs.decodeUtf8(writer.getBytes());
        // //s = s.substring(1);
        // json.push(s)
        // reader.next();
        // reader.stepIn();
        // reader.next();
        // reader.next();
        // reader.next();
        // console.log(reader.fieldName());
        // console.log(ionjs.decodeUtf8(reader.byteValue()));
        reader.next();
        let obj = utils.recursivePathLookup(reader,[]);
        json.push({data: obj.data, blockAddress: obj.blockAddress});
        //json.push(utils.getFieldValue(reader,["data"]));
        //console.log(utils.getFieldValue(reader,["data"]));
    })
    //let records = ionjs.decodeUtf8(writer.getBytes());

    console.log(json);
    //qldbWriter = AmazonQLDBDriverNodejs.createQldbWriter();
}



var main2 = async function(){
    console.log("calling main2 ");
    
    const qldbSession = await qldbDriver.getSession();
    for (const table of await qldbSession.getTableNames()) {
        console.log(table);
    }
    const qldbWriter = AmazonQLDBDriverNodejs.createQldbWriter();
    const dealId = "108570";
    utils.writeValueAsIon(dealId, qldbWriter);
    const statement = "UPDATE Deal as v set v.status='dmv-rejected' where v.dealId=?"
    let r = await (await qldbSession.executeStatement(statement,[qldbWriter])).getResultList();
    
    const writer = ionjs.makeTextWriter();
    r.forEach(reader=>{
        writer.writeValues(reader);
        
    })
    console.log(ionjs.decodeUtf8(writer.getBytes()));
}

main2();
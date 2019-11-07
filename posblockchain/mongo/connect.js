const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017/blockship";
function signUp(email, password, passwordConfirm, publicKey, privateKey){
    if(password !== passwordConfirm){
        return false;
    }

    MongoClient.connect(url,function(err,db){
        db.collection('Users').insertOne({
            email: email,
            password:password,
            publicKey: publicKey,
            privateKey:privateKey
        });
    });
}

function editProfile(companyName, address1, address2, state, zip, country, phone){
    if(password !== passwordConfirm){
        return false;
    }
    
    MongoClient.connect(url,function(err,db){
        db.collection('Users').insertOne({
            companyName: companyName,
            address1:address1,
            address2:address2,
            state:state,
            zip:zip,
            country:country,
            phone:phone
        })
    })
}
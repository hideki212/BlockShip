const express = require("express");
const Blockchain = require("../blockchain/blockchain");
const bodyParser = require("body-parser");
const P2pserver = require("../app/p2p-server");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");
const { TRANSACTION_THRESHOLD } = require("../config");

const HTTP_PORT = 3000;

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const wallet = new Wallet("i am the first leader");

const transactionPool = new TransactionPool();
const p2pserver = new P2pserver(blockchain, transactionPool, wallet);
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017/blockship";
function signUp(email, password, passwordConfirm, type){
    
    if(password !== passwordConfirm){
        return false;
    }
    var secret =  SHA256(JSON.stringify(email + " " + password)).toString();
    var createWallet = new Wallet(secret)
    MongoClient.connect(url,function(err,db){
        db.collection('Users').insertOne({
            email: email,
            password:password,
            publicKey: createWallet.getPublicKey(),
            privateKey:secret,
            type:type
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
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get("/ico/transactions", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json(transactionPool.transactions);
});

app.get("/ico/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/ico/transact", (req, res) => {
  console.log("\nThis is the body " + req.body.info + "\n");
  const { to, amount, info, type } = req.body;
  const transaction = wallet.createTransaction(
    to,
    amount,
    info,
    type,
    blockchain,
    transactionPool
  );
  p2pserver.broadcastTransaction(transaction);
  if (transactionPool.transactions.length >= TRANSACTION_THRESHOLD) {
    let block = blockchain.createBlock(transactionPool. transactions, wallet);
    p2pserver.broadcastBlock(block);
  }
  res.redirect("/ico/transactions");
});

app.get("/ico/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/ico/balance", (req, res) => {
  res.json({ balance: blockchain.getBalance(wallet.publicKey) });
});
app.post("/ico/createuser", (req, res) => {
  const { email, password, passwordConfirm, type } = req.body;
  signUp(email, password,passwordConfirm, type)
  res.json({ balance: blockchain.getBalance(wallet.publicKey) });
});
app.post("/ico/balance-of", (req, res) => {
  var balance = 0;
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == req.body.publicKey){
      balance += transaction.output.amount
    }
  });
  res.json({ balance: balance });
});
app.post("/ico/data-of", (req, res) => {
  var data = [];
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == req.body.publicKey){
      data.push(transaction.output.info);
    }
  });
  res.json({ data: data });
});
app.post("/ico/send-of", (req, res) => {
  var data = [];
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == req.body.publicKey){
      data.push(transaction.output.info);
    }
  });
  res.json({ data: data });
});
app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});

p2pserver.listen();

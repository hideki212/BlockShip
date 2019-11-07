const express = require("express");
const Blockchain = require("../blockchain/blockchain");
const bodyParser = require("body-parser");
const P2pServer = require("./p2p-server.js");
const Wallet = require("../wallet/wallet.js");
const TransactionPool = require("../wallet/transaction-pool");
const Account = require('../blockchain/account')
const SHA256 = require("crypto-js/sha256");
const HTTP_PORT = process.env.HTTP_PORT || 3001;
// create a new wallet
const wallet = new Wallet(Date.now().toString());
// Date.now() is used create a random string for secret
// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();
//get the port from the user or set the default port

//create a new app
const app = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();
const p2pserver = new P2pServer(blockchain, transactionPool, wallet);
const account = new Account();

//EXPOSED APIs

//api to get the blocks
app.get("/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.get("/transactions", (req, res) => {
  res.send(transactionPool.transactions);
});

//api to add blocks
app.post("/mine", (req, res) => {
  const block = blockchain.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);
  p2pserver.syncChain();
  res.redirect("/blocks");
});
// create transactions
app.post("/transact", (req, res) => {
  const { to, amount, info, type } = req.body;
  const transaction = wallet.createTransaction(
    to,
    amount,
    info,
    type,
    blockchain,
    transactionPool
  );
  res.redirect("/transactions");
});

app.get("/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/balance", (req, res) => {
  var balance = 0;
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == wallet.publicKey){
      balance += transaction.output.amount
    }
  });
  console.log(transactionPool.transactions);
  console.log(blockchain.getBalance(wallet.publicKey));
  res.json({ balance: balance });
});
app.get("/data", (req, res) => {
  var data = [];
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == wallet.publicKey){
      data.push(transaction.output.info);
    }
  });
  res.json({ data: data });
});
// app server configurations
app.listen(HTTP_PORT, () => {
  console.log(`listening on port ${HTTP_PORT}`);
});
p2pserver.listen();

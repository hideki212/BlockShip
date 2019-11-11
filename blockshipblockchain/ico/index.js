const express = require("express");
const Blockchain = require("../blockchain/blockchain");
const bodyParser = require("body-parser");
const P2pserver = require("../app/p2p-server");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");
const User = require("../user/usermodel")
const UserDetails = require("../user/userdetails")
const SHA256 = require("crypto-js/sha256");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { TRANSACTION_THRESHOLD } = require("../config");
const { SECRET } = require("../config");
const jwt = require('jsonwebtoken');
const config = require('../config');
const middleware = require('../user/middlewareJWToken');
const HTTP_PORT = 3000;
const Speakeasy = require("speakeasy");
const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const wallet = new Wallet("i am the first leader");

const transactionPool = new TransactionPool();
const p2pserver = new P2pserver(blockchain, transactionPool, wallet);


//connect to MongoDB
mongoose.connect('mongodb://localhost/BlockShip');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));
// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/ico/transactions",middleware.checkToken, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json(transactionPool.transactions);
});

app.get("/ico/blocks",middleware.checkToken, (req, res) => {
  res.json(blockchain.chain);
});

app.post("/ico/transact",middleware.checkToken, (req, res) => {
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

app.get("/ico/public-key",middleware.checkToken, (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/ico/balance",middleware.checkToken, (req, res) => {
  res.json({ balance: blockchain.getBalance(wallet.publicKey) });
});

app.post("/ico/balance-of",middleware.checkToken, (req, res) => {
  var balance = 0;
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == req.body.publicKey){
      balance += transaction.output.amount
    }
  });
  res.json({ balance: balance });
});
app.post("/ico/data-of",middleware.checkToken, (req, res) => {
  var data = [];
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == req.body.publicKey){
      data.push(transaction.output.info);
    }
  });
  res.json({ data: data });
});
app.post("/ico/send-of",middleware.checkToken, (req, res) => {
  var data = [];
  transactionPool.transactions.forEach(transaction => {
    if(transaction.output.to == req.body.publicKey){
      data.push(transaction.output.info);
    }
  });
  res.json({ data: data });
});

// user routes
app.post("/ico/register", (req, res) => {
  const { email, password, passwordConfirm, type } = req.body;
  if(password !== passwordConfirm){
    return res.json({ success: false, message: "passwords do not match"  });
  }
  if (email && password && passwordConfirm && type) {
    var time = Date.now().toString();
    var secret =  SHA256(JSON.stringify(email + " " + password + " " + time)).toString();
    var createWallet = new Wallet(secret)
    var userData = {
      email: email,
      username: email,
      password: password,
      type: type,
      publicKey:  createWallet.publicKey,
      privateKey: secret,
      registrationDate: time
    }
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      console.log(userData);
      if (err) {
        return res.json(err);
      } else {
        console.log(user)
        return res.json({id: user._id, email: user.email, type:user.type, publicKey:user.publicKey});
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return res.json({success: false, error:err});
  }
});
//
app.post("/ico/totp-secret", (request, response, next) => {
  var secret = Speakeasy.generateSecret({ length: 20 });
  
});

app.post("/ico/totp-generate", (request, response, next) => {
  response.send({
    "token": Speakeasy.totp({
        secret: request.body.secret,
        encoding: "base32"
    }),
    "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
});

});
app.post("/ico/totp-validate", (request, response, next) => {
  response.send({
      "valid": Speakeasy.totp.verify({
          secret: request.body.secret,
          encoding: "base32",
          token: request.body.token,
          window: 0
      })
  });
});
app.post('/ico/login', (req, res, next)=>{
  const { email, password } = req.body;
  if (email && password) {
    User.authenticate(email, password, function (error, user) {
      if (error || !user) {
        res.send(403).json({
          success: false,
          message: 'Incorrect username or password'
        });
        return next(err);
      } else {
        var secret = Speakeasy.generateSecret({ length: 20 });
        let token = jwt.sign({username: email},
          SECRET,
          { 
            expiresIn: '24h' // expires in 24 hours
          }
        );
        var pk = "none";
        User.find({email:email}, function(err,result){
          if (err) throw err;
          console.log(result[0].publicKey);
          res.json({
            success: true,
            message: 'Authentication successful!',
            token: token,
            publicKey: result[0].publicKey,
            userType: result[0].type,
            uid: result[0]._id,
            email: email
          });
        });
      }
    });
  }
})

// GET route after registering
app.get('/ico/profile',middleware.checkToken, (req, res, next) => {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});
// GET for logout logout
app.get('/ico/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

app.post("/ico/edituser",middleware.checkToken, (req, res) => {
  const { companyName, address1, address2, state, zip, country, phone, publicKey } = req.body;
  var userdetails = {
    companyName:companyName,
    address1: address1,
    address2:address2,
    state:state,
    zip:zip,
    country:country,
    phone:phone,
    publicKey:publicKey
  }
  UserDetails.create(userdetails, function(err, userDetails){
    console.log(userData);
    if (err) {
      return res.json(err);
    } else {
      console.log(userDetails)
      return  res.json(user);
    }
  })
});




app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});

p2pserver.listen();

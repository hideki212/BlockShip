const ChainUtil = require("../chain-util.js");
const { INITIAL_BALANCE } = require("../config");
const Transaction = require("./transaction");

class Wallet {
  constructor(secret) {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair(secret);
    this.publicKey = this.keyPair.getPublic("hex");
  }

  toString() {
    return `Wallet - publicKey: ${this.publicKey.toString()} balance  : ${
      this.balance
    }`;
  }
  sign(dataHash) {
    return this.keyPair.sign(dataHash).toHex();
  }
  createTransaction(to, amount, info, type, blockchain, transactionPool) {
    // this.balance = this.getBalance(blockchain);
    // if (amount > this.balance) {
    //   console.log(
    //     `Amount: ${amount} exceeds the current balance: ${this.balance}`
    //   );
    //   return;
    // }
    let transaction = Transaction.newTransaction(this, to, amount, info, type);
    transactionPool.addTransaction(transaction);
    return transaction;
  }
  getBalance(blockchain) {
    return blockchain.getBalance(this.publicKey);
  }
  getPublicKey() {
    return this.publicKey;
  }
}
module.exports = Wallet;

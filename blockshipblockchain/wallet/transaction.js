const ChainUtil = require("../chain-util");
const { TRANSACTION_FEE } = require("../config");
class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.type = null;
    this.input = null;
    this.output = null;
  }
  static newTransaction(senderWallet, to, amount, info, type) {
    if (amount + TRANSACTION_FEE > senderWallet.balance) {
      console.log("Not enough balance");
      return;
    }
    return Transaction.generateTransaction(
      senderWallet,
      to,
      amount,
      info,
      type
    );
  }

  static generateTransaction(senderWallet, to, amount, info, type) {
    const transaction = new this();
    transaction.type = type;
    transaction.output = {
      to: to,
      amount: amount - TRANSACTION_FEE,
      info: info,
      fee: TRANSACTION_FEE
    };
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static signTransaction(transaction, senderWallet) {
    var sign = senderWallet.sign(ChainUtil.hash(transaction.output));
    console.log(sign);
    transaction.input = {
      timestamp: Date.now(),
      from: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.output))
    };
  }
  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.from,
      transaction.input.signature,
      ChainUtil.hash(transaction.output)
    );
  }
}

module.exports = Transaction;

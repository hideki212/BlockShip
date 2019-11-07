class Stake {
  constructor() {
    this.addresses = [
      "5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614"
    ];
    this.balance = {
      "5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614": 100
    };
  }

  initialize(address) {
    if (this.balance[address] == undefined) {
      this.balance[address] = 0;
      this.addresses.push(address);
    }
  }

  addStake(from, amount) {
    this.initialize(from);
    this.balance[from] += amount;
  }
  getBalance(address) {
    this.initialize(address);
    return this.balance[address];
  }
  getStake(address) {
    this.initialize(address);
    return this.balance[address];
  }

  getMax(addresses) {
    let balance = -1;
    let leader = undefined;
    addresses.forEach(address => {
      if (this.getBalance(address) > balance) {
        leader = address;
      }
    });
    return leader;
  }

  update(transaction) {
    let amount = transaction.output.amount;
    let from = transaction.input.from;
    this.addStake(from, amount);
  }
  fiftyOnePercentStake(addresses) {
    addresses.forEach(address => {
      if (this.getBalance(address) > TOTAL_COINS * 0.5) {
        addresses.forEach(address2 => {
          if (address !== address2) {
            this.increment(address, 1);
          }
        });
      }
    });
  }
}

module.exports = Stake;

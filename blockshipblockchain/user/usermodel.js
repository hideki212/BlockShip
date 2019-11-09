var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  type:{
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
    unique: true,
    required: true,
  }, 
  privateKey: {
    type: String,
    required: true,
    unique: true,
    required: true,
  }, 
  registrationDate: {
    type: String,
    required: true,
  }
});
//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    console.log("pre user")
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        console.log(err)
        return next(err);
      }
      user.password = hash;
      next();
    })
});
//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    console.log("auth user")
    User.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
  }
var User = mongoose.model('User', UserSchema);
module.exports = User;
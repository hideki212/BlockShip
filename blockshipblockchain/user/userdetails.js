var mongoose = require('mongoose');
var UserDetailsSchema = new mongoose.Schema({
companyName: {
    type: String,
    required: true
  },
  address1: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  address2: {
    type: String
  },
  state:{
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true
  }, 
  country: {
    type: String,
    required: true
  }, 
  phone: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  }
});
var UserDetails = mongoose.model('UserDetails', UserDetailsSchema);
module.exports = UserDetails;
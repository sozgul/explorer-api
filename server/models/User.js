const dynamoose = require('dynamoose');

var userSchema = new dynamoose.Schema({
  userid: {
    type: String,
    hashKey: true
  },
  phone: String,
  country: String,
  nationalPhoneNumber: String,
  countryCallingCode: String,
  phoneIsValidNumber: String,
  phoneVerificationStatus: String,
  displayName: String
}, {
  timestamps: true
});

var User = dynamoose.model('User', userSchema);

module.exports = {
  User: User
};

const dynamoose = require('dynamoose');

var refreshTokenSchema = new dynamoose.Schema({
  refreshToken: {
    type: String,
    hashKey: true
  },
  accessToken: String,
  phone: String,
  status: String
}, {
  timestamps: true
});

var RefreshToken = dynamoose.model('RefreshToken', refreshTokenSchema);

module.exports = {
  RefreshToken: RefreshToken
};
const dynamoose = require('dynamoose');

var sharedMapSchema = new dynamoose.Schema({
  mapid: {
    type: String,
    hashKey: true
  },
  creatorID: {
    type: String,
    required: true
  },
  subject: String,
  participants: {
    type: 'list',
    list: [
      {
        participantID: String,
        role: String
      }
    ],
    required: true
  }
}, {
  timestamps: true
});

var SharedMap = dynamoose.model('SharedMap', sharedMapSchema);

module.exports = {
  SharedMap: SharedMap
};

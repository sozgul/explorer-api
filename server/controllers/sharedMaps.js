const {logger} = require('./../logger');
const SharedMap = require('./../models/SharedMap').SharedMap;
const uuid = require('uuid');

/**
 * @param req
 * @param res
 */

/**
 * Create new user with validated phone number
 *
 */
exports.createSharedMap = function (req, res) {

  const creatorID = req.body.creatorID;
  const participants = req.body.participants;
  const subject = req.body.subject;
  
  var generatedID = uuid.v4();

  var newSharedMap = new SharedMap({
    mapid: generatedID,
    creatorID: creatorID,
    subject: subject,
    participants: participants
  });

  newSharedMap.save(function (err, data) {
    if(err) { 
      logger.info(err); 
      return res.status(500).json(err);
    } else {
      logger.info('New shared map successfully saved');
      logger.info('API response:');
      logger.info(data);
      return res.status(200).json(data);
    }
  });
};
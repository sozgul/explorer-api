const phoneReg = require('./lib/phoneVerification/phoneVerification')(process.env.TWILIO_API_KEY);
const dynamoDB = require('./dynamoDB');
const {logger} = require('./logger');

/**
 * Register a phone
 *
 * @param req
 * @param res
 */
exports.requestPhoneVerification = function (req, res) {
  var phone_number = req.body.phoneDetails.phone;
  var country_code = req.body.phoneDetails.countryCallingCode;
  var via = 'sms';

  if (phone_number && country_code && via) {
    phoneReg.requestPhoneVerification(phone_number, country_code, via, function (err, response) {
      if (err) {
        logger.info('error creating phone reg request', err);
        res.status(400).json(err);
      } else {
        logger.info('Success register phone API call: ', response);
        res.status(200).json(response);
        logger.info('API response:');
        logger.info(response);
      }
    });
  } else {
    logger.info('Failed in Register Phone API Call', req.body);
    res.status(500).json({error: 'Missing fields'});
  }
};

/**
* Confirm a phone registration token
*
* @param req
* @param res
*/
exports.verifyPhoneToken = function (req, res) {
  var phone_number = req.body.phoneDetails.phone;
  var country_code = req.body.phoneDetails.countryCallingCode;
  var token = req.body.verificationToken;

  if (phone_number && country_code && token) {
    phoneReg.verifyPhoneToken(phone_number, country_code, token, function (err, response) {
      if (err) {
        logger.info('error creating phone reg request', err);
        res.status(500).json(err);
      } else {
        logger.info('Confirm phone success confirming code: ', response);
        if (response.success) {
          logger.info('Verification successful, proceeding to create user');
          dynamoDB.createValidatedUser(req, res);
        } else {
          res.status(401).json(err);
        }
      }
    });
  } else {
    logger.info('Failed in Confirm Phone request body: ', req.body);
    res.status(500).json({error: 'Missing fields'});
  }
};


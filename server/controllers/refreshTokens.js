const {logger} = require('./../logger');
const RefreshToken = require('./../models/RefreshToken').RefreshToken;

const jwt = require('jsonwebtoken');
const accessTokenSecret = 'SUPER_SECRET_ACCESS_KEY'; //normally stored in process.env.secret
const accessTokenLifetime = 300;

/**
 * @param req
 * @param res
 */

/**
 * Check the validity of a refresh token
 *
 */
exports.checkRefreshToken = function (req, res) {
  var phoneInfo = req.body.phoneDetails;
  var refreshToken = req.body.refreshToken;
  var completePhoneNumber = phoneInfo.countryCallingCode + phoneInfo.phone;

  logger.info('Checking db for refresh token associated with: ' + completePhoneNumber);
  RefreshToken.get(refreshToken, // this is the table key 
    function (err, queryResult) {
      if(err){
        logger.info('Error while getting refresh token: ' + err);
      } else {
        logger.info('Refresh token retrieved successfully: ');
        logger.info(queryResult);

        if(queryResult != null) {
          if(queryResult.phone == completePhoneNumber){
            logger.info('Number matches, proceeding to renew the refresh token: ');
            const newAccessToken = jwt.sign({ phone: completePhoneNumber }, accessTokenSecret, {expiresIn: accessTokenLifetime});
            queryResult.accessToken = newAccessToken;
            queryResult.save(function (err, data) {
              if(err) { 
                logger.info('Save failed, unable to update refresh token'); 
                logger.info(err); 
                return res.status(401).send(err);
              } else {
                logger.info('Refresh token updated succesfully');
                logger.info('API response:');
                logger.info(data);
                return res.status(200).send(newAccessToken);
              }
            });
          }
        }
        else {
          logger.info('No refresh token record found with given details');
          res.send(404);
        }
      }
    });
  
  // if( (refreshToken in refreshTokens) && refreshTokens[refreshToken].phone == completePhoneNumber ) {
  //   const newAccessToken = jwt.sign({ phone: completePhoneNumber }, accessTokenSecret, {expiresIn: accessTokenLifetime});
  //   refreshTokens[refreshToken].token = newAccessToken;
  //   res.json({token: newAccessToken});
  // } else {
  //   res.send(401);
  // }
};

/**
 * Revoke a refresh token
 *
 */
exports.revokeRefreshToken = function (req, res) {
  var refreshToken = req.body.refreshToken;
  logger.info('Received revoke request for refresh token');
  RefreshToken.delete(refreshToken, function(err){
    if(err){
      return res.status(500).json(err);
    } else {
      logger.info('Refresh token revoked succesfully');
      return res.send(204);
    }
  });
};
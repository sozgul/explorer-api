const {logger} = require('./../logger');
const uuid = require('uuid');
const User = require('./../models/User').User;
const RefreshToken = require('./../models/RefreshToken').RefreshToken;
const jwt = require('jsonwebtoken');
const accessTokenSecret = 'SUPER_SECRET_ACCESS_KEY'; //normally stored in process.env.secret
const accessTokenLifetime = 300;
const refreshTokenSecret = 'SUPER_SECRET_REFRESH_KEY'; //normally stored in process.env.secret
const refreshTokenLifetime = 604800;

/**
 * @param req
 * @param res
 */

/**
 * Create new user with validated phone number
 *
 */
exports.createValidatedUser = function (req, res) {
  const newUserPhoneInfo = req.body.phoneDetails;
  logger.info(newUserPhoneInfo);
  var completePhoneNumber = newUserPhoneInfo.countryCallingCode + newUserPhoneInfo.phone;
  var generatedID = uuid.v4();

  var newUser = new User({
    userid: generatedID,
    phone: completePhoneNumber,
    nationalPhoneNumber: newUserPhoneInfo.phone,
    countryCallingCode: newUserPhoneInfo.countryCallingCode,
    phoneIsValidNumber: String(newUserPhoneInfo.valid),
    phoneVerificationStatus: 'unverified',
    country: newUserPhoneInfo.country
  });

  newUser.save(function (err, data) {
    if(err) { 
      logger.info(err); 
      return res.status(500).json(err);
    } else {
      logger.info('New user successfully saved');
      logger.info('API response:');
      logger.info(data);
      
      const accessToken = jwt.sign({ userid: generatedID }, accessTokenSecret, {expiresIn: accessTokenLifetime});
      const refreshToken = jwt.sign({ userid: generatedID}, refreshTokenSecret, {expiresIn: refreshTokenLifetime});

      var response = {
        status: 'authenticated',
        phone: completePhoneNumber,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userid: generatedID
      };

      //refreshTokens[refreshToken] = response; 

      var newRefreshToken = new RefreshToken(response);

      newRefreshToken.save(function (err, data) {
        if(err) {
          logger.info(err); 
          return res.status(500).json(err);
        } else {
          logger.info('New refresh token successfully saved');
          logger.info(data);
          return res.status(200).json(response);
        }
      });   
    }
  });
};

/**
 * Create unverified draft user 
 *
 */
exports.createDraftUser = function (req, res) { 
  const newUserPhoneInfo = req.body.phoneDetails;
  logger.info(newUserPhoneInfo);

  var completePhoneNumber = newUserPhoneInfo.countryCallingCode + newUserPhoneInfo.phone;
  var generatedID = uuid.v4();

  var newUser = new User({
    userid: generatedID,
    phone: completePhoneNumber,
    nationalPhoneNumber: newUserPhoneInfo.phone,
    countryCallingCode: newUserPhoneInfo.countryCallingCode,
    phoneIsValidNumber: String(newUserPhoneInfo.valid),
    phoneVerificationStatus: 'unverified',
    country: newUserPhoneInfo.country
  });

  newUser.save(function (err, data) {
    if(err) { 
      return logger.info(err); 
    } else {
      logger.info('New user successfully saved');
      logger.info('API response:');
      logger.info(data);

      const accessToken = jwt.sign({ userid: generatedID }, accessTokenSecret, {expiresIn: accessTokenLifetime});
      const refreshToken = jwt.sign({ userid: generatedID}, refreshTokenSecret, {expiresIn: refreshTokenLifetime});

      var response = {
        status: 'authenticated',
        phone: completePhoneNumber,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userid: generatedID
      };

      //refreshTokens[refreshToken] = response; 

      var newRefreshToken = new RefreshToken(response);

      newRefreshToken.save(function (err, data) {
        if(err) {
          logger.info(err); 
          return res.status(500).json(err);
        } else {
          logger.info('New refresh token successfully saved');
          logger.info(data);
          return res.status(200).json(response);
        }
      });   
    }
  });

  // // Code below is reference on how to interact with DynamoDB without dynamoose
  //
  // const params = {
  //   TableName :'Users',
  //   Item:{
  //     'userid': {
  //       S: 'U-' + uuid.v4()
  //     },
  //     'nationalNumber': {
  //       S: newUserPhoneInfo.phone
  //     },
  //     'phoneCountryCode': {
  //       S: newUserPhoneInfo.countryCallingCode
  //     },
  //     'phone': {
  //       S: newUserPhoneInfo.countryCallingCode + newUserPhoneInfo.phone
  //     },
  //     'phoneIsValidNumber': {
  //       S: String(newUserPhoneInfo.valid)
  //     },
  //     'phoneVerificationStatus': {
  //       S: verificationStatus
  //     },
  //     'country': {
  //       S: newUserPhoneInfo.country
  //     }
  //   }
  // };
  // dynamodb.putItem(params, function(err, data) {
  //   if (err) {
  //     logger.info('Unable to add item: ' + '\n' + JSON.stringify(err, undefined, 2));
  //   } else {
  //     logger.info('PutItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2));
  //   }
  // });
};

/**
 * Read user via phone information
 *
 */
exports.findUserWithPhone = function (req, res) {
  var phoneInfo = req.body.phoneDetails;
  logger.info('searching for : ' + phoneInfo.countryCallingCode + phoneInfo.phone);

  User.scan('phone').eq(phoneInfo.countryCallingCode + phoneInfo.phone).exec(
    function (err, scanResults) {
      if(err){
        logger.info('Error while getting user: ' + err);
      } else {
        logger.info('Query completed ');
        if(scanResults == null){
          logger.info('No user record found with given details');
          res.send(404);
        } else {
          logger.info('API response:');
          logger.info(scanResults);
          res.status(200).send(scanResults);
          return scanResults;
        }
        
      }
    });

  // // Code below is reference on how to interact with DynamoDB without dynamoose
  //
  // const params = {
  //   TableName :'Users',
  //   Key:{
  //     'phone': {
  //       S: phoneInfo.countryCallingCode + phoneInfo.phone
  //     }
  //   }
  // };
  // dynamodb.getItem(params, function(err, data) {
  //   if (err) {
  //     logger.info('Unable to get item: ' + '\n' + JSON.stringify(err, undefined, 2));
  //   } else {
  //     logger.info('Get item succeeded: ' + '\n' + JSON.stringify(data, undefined, 2));
  //   }
  // });  
};

/**
 * Update user with given settings 
 *
 */
exports.updateUserSettings = function (req, res) {
  var settingsInfo = req.body.settings;
  var userid = req.body.userid;
  var phoneInfo = req.body.phoneDetails;
  
  if (userid != null ) {
    logger.info('Retrieving user account to update: ' + userid);
    User.get(userid, function (err, queryResult) {
      if(err){
        logger.info('Error while getting user: ' + err);
      } else {
        logger.info('Query completed ');
        if(queryResult == null){
          logger.info('No user record found with given details');
          res.send(404);
        } else {
          logger.info('Retrieval successful: ');
          logger.info(queryResult);

          logger.info('Proceeding to update with the following settings: ');
          logger.info(settingsInfo);

          queryResult.displayName = settingsInfo.displayName;
          queryResult.save(function (err, data) {
            if(err) { 
              logger.info(err);
              res.status(500).send(err);
            } else {
              logger.info('User updated succesfully');
              logger.info('API response:');
              logger.info(data);
              res.status(200).send(data);
              return data;
            }
          });
        }     
      }
    });
  } else if( phoneInfo != null) {
    var completePhoneNumber = phoneInfo.countryCallingCode + phoneInfo.phone;
    logger.info('Retrieving associated user to update: ' + completePhoneNumber);
    User.scan('phone').eq(phoneInfo.countryCallingCode + phoneInfo.phone).exec(
      function (err, scanResults) {
        if(err){
          logger.info('Error while scanning associated user: ' + err);
        } else {
          logger.info('Scan completed ');
          logger.info(scanResults.length);
          if(scanResults == null){
            logger.info('No user record found with given details');
            res.send(404);
          } else if (scanResults.length > 1) {
            logger.info('Multiple user records found with given details, provide userid to locate unique record');
            res.send(404);
          } else {
            logger.info('Scan successful: ');
            logger.info(scanResults);
            logger.info(scanResults[0].userid);
            
            scanResults[0].displayName = settingsInfo.displayName;
            scanResults[0].save(function (err, data) {
              if(err) { 
                logger.info(err);
                res.status(500).send(err);
              } else {
                logger.info('User updated succesfully');
                logger.info('API response:');
                logger.info(data);
                res.status(200).send(data);
                return data;
              }
            });
            
          }
        }  
      }
    );
  } else if (userid == null & phoneInfo == null){
    logger.info('Retrieval unsuccesfull, necessary information not provided');
    res.status(500).send('Necessary retrieval information not provided');
  }

  // // Code below is reference on how to interact with DynamoDB without dynamoose
  //
  // const params = {
  //   TableName :'Users',
  //   Key:{
  //     'phone': { S: phoneInfo.countryCallingCode + phoneInfo.phone}
  //   },
  //   UpdateExpression: 'set displayName = :dN',
  //   ExpressionAttributeValues:{
  //     ':dN': { S: settingsInfo.displayName }
  //   },
  //   ReturnValues: 'UPDATED_NEW'
  // };
  // dynamodb.updateItem(params, function(err, data) {
  //   if (err) {
  //     logger.info('Unable to update item: ' + '\n' + JSON.stringify(err, undefined, 2));
  //   } else {
  //     logger.info('UpdateItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2));
  //   }
  // });
};


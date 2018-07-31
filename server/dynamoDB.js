const {logger} = require('./logger');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const dynamoose = require('dynamoose');
const jwt = require('jsonwebtoken');
const accessTokenSecret = 'SUPER_SECRET_ACCESS_KEY'; //normally stored in process.env.secret
const refreshTokenSecret = 'SUPER_SECRET_REFRESH_KEY'; //normally stored in process.env.secret
const accessTokenLifetime = 300;
const refreshTokenLifetime = 604800;
//var refreshTokens = {}; 

/* Dynamoose Configuration */
dynamoose.setDefaults({
  // Uncomment the line below for use in production 
  // It's not recommended for dynamoose to auto create inexistent tables in production
  // create: false,
  prefix: '', // adding a prefix creates a seperate record for dynamoose if create is set to "true"
  suffix: ''
});
/* Comment out the line below for use in production */
//dynamoose.local('http://localhost:8000');

/* AWS Configuration */
AWS.config.update({
  region: 'us-east-1',
  // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
  /* Comment out the line below for use in production */
  //endpoint: 'http://localhost:8000',
  /* Comment out the line below for use in local development */
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
  /*
    accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB. 
    For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
    Comment out the credentials below for production use
  */
  //accessKeyId: 'fakeMyKeyId',
  //secretAccessKey: 'fakeSecretAccessKey'
});
/*
   Uncomment the following code to configure Amazon Cognito and make sure to
   remove the endpoint, accessKeyId and secretAccessKey specified in the code above.
   Make sure Cognito is available in the DynamoDB web service region (specified above).
   Finally, modify the IdentityPoolId and the RoleArn with your own.
*/
/*
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
IdentityPoolId: 'us-west-2:12345678-1ab2-123a-1234-a12345ab12',
RoleArn: 'arn:aws:iam::123456789012:role/dynamocognito'
});
*/
// // Line below is reference on how to interact with DynamoDB without dynamoose
// const dynamodb = new AWS.DynamoDB(); 
/**
 * @param req
 * @param res
 */

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
      return logger.info(err); 
    } else {
      logger.info('New user successfully saved');
      logger.info('API response:');
      logger.info(data);
      
      const accessToken = jwt.sign({ completePhoneNumber }, accessTokenSecret, {expiresIn: accessTokenLifetime});
      const refreshToken = jwt.sign({ completePhoneNumber}, refreshTokenSecret, {expiresIn: refreshTokenLifetime});

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

      const accessToken = jwt.sign({ completePhoneNumber }, accessTokenSecret, {expiresIn: accessTokenLifetime});
      const refreshToken = jwt.sign({ completePhoneNumber}, refreshTokenSecret, {expiresIn: refreshTokenLifetime});

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
    function (err, queryResult) {
      if(err){
        logger.info('Error while getting user: ' + err);
      } else {
        logger.info('Query completed ');
        if(queryResult == null){
          logger.info('No user record found with given details');
          res.send(404);
        } else {
          logger.info('API response:');
          logger.info(queryResult);
          res.status(200).send(queryResult);
          return queryResult;
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
  var phoneInfo = req.body.phoneDetails;
  var settingsInfo = req.body.settings;
  var completePhoneNumber = phoneInfo.countryCallingCode + phoneInfo.phone;
  logger.info('Retrieving user to update: ' + completePhoneNumber);
  User.scan('phone').eq(phoneInfo.countryCallingCode + phoneInfo.phone).exec(
    function (err, queryResult) {
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
              return logger.info(err); 
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

// TOKEN INFRASTRUCTURE

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

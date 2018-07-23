const {logger} = require('./logger');
const AWS = require('aws-sdk');
var uuid = require('uuid');

AWS.config.update({
  region: 'us-east-1',
  // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
  /*
    accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB.
    For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  */
  // accessKeyId: 'fakeMyKeyId',
  // secretAccessKey: 'fakeSecretAccessKey'
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

const dynamodb = new AWS.DynamoDB();
/**
 * @param req
 * @param res
 */

/**
 * Create new user with validated phone number
 *
 */
exports.createValidatedUser = function (phoneInfo) {
  this.createNewUser(phoneInfo,'verified');
};

/**
 * Create unverified draft user 
 *
 */
exports.createDraftUser = function (phoneInfo) {
  this.createNewUser(phoneInfo,'unverified');
};

/**
 * Create new user 
 *
 */
exports.createNewUser = function (phoneInfo, verificationStatus) {
  const newUserPhoneInfo = phoneInfo;
  logger.info(phoneInfo);
  const params = {
    TableName :'Users',
    Item:{
      'userid': {
        S: 'U-' + uuid.v4()
      },
      'phone': {
        S: newUserPhoneInfo.phone
      },
      'phoneCountryCode': {
        S: newUserPhoneInfo.countryCallingCode
      },
      'phoneIsValidNumber': {
        S: String(newUserPhoneInfo.valid)
      },
      'phoneVerificationStatus': {
        S: verificationStatus
      },
      'country': {
        S: newUserPhoneInfo.country
      }
    }
  };
  dynamodb.putItem(params, function(err, data) {
    if (err) {
      logger.info('Unable to add item: ' + '\n' + JSON.stringify(err, undefined, 2));
    } else {
      logger.info('PutItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2));
    }
  });
};

/**
 * Read user with given phone 
 *
 */
exports.readUser = function (phoneInfo) {
  // const params = {
  //   TableName :'Users',
  //   Key:{
  //     'phone': {
  //       S: phoneInfo.phone
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

  logger.info(phoneInfo);

  const params = {
    TableName : 'Users',
    ProjectionExpression: '#phoneCountryCode, #phone',
    KeyConditionExpression: '#phoneCountryCode = :countryCallingCode and #phone = :nationalNumber',
    ExpressionAttributeNames:{
      '#phoneCountryCode': 'phoneCountryCode',
      '#phone': 'phone'
    },
    ExpressionAttributeValues: {
      ':countryCallingCode': { 'S': phoneInfo.countryCallingCode },  
      ':nationalNumber': { 'S': phoneInfo.phone }
    }
  };

  dynamodb.query(params, function(err, data) {
    if (err) {
      logger.info('Unable to query. Error:', JSON.stringify(err, null, 2));
    } else {
      logger.info('Query succeeded.');
      logger.info(data);
      if(data.Count > 0){
        data.Items.forEach(function(item) {
          logger.info('Found # on records: +', item.phoneCountryCode.S + ' ' + item.phone.S);
        });
      } else {
        logger.info('No recorded # matches: +', phoneInfo.countryCallingCode + ' ' + phoneInfo.phone);
      }
      
    }
  });
};


/**
 * Update user with given settings 
 *
 */
exports.updateUserSettings = function (phoneInfo, settingsInfo) {
  logger.info('settingsInfo: ');
  logger.info(settingsInfo);
  const params = {
    TableName :'Users',
    Key:{
      'phone': {
        S: phoneInfo.phone
      }
    },
    UpdateExpression: 'set displayName = :dN',
    ExpressionAttributeValues:{
      ':dN': {
        S: settingsInfo.displayName
      }
    },
    ReturnValues: 'UPDATED_NEW'
  };
  dynamodb.updateItem(params, function(err, data) {
    if (err) {
      logger.info('Unable to update item: ' + '\n' + JSON.stringify(err, undefined, 2));
    } else {
      logger.info('UpdateItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2));
    }
  });
};


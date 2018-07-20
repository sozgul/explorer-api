const {logger} = require('./logger');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
  endpoint: 'http://localhost:8000',
  /*
    accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB.
    For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  */
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey'
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
 * Create new user with validated phone number
 *
 * @param req
 * @param res
 */
exports.createValidatedUser = function (phoneInfo) {
  const newUserPhoneInfo = phoneInfo;
  logger.info(phoneInfo);
  const params = {
    TableName :'Users',
    Item:{
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
        S: 'verified'
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

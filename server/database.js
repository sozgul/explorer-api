const AWS = require('aws-sdk');
const dynamoose = require('dynamoose');

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


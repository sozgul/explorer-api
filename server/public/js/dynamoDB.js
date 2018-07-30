
/* global AWS, document */

AWS.config.update({
  region: 'us-east-1',
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

var dynamodb = new AWS.DynamoDB();

// eslint-disable-next-line no-unused-vars
function createUsersTable() {
  var params = {
    TableName : 'Users',
    KeySchema: [
      { AttributeName: 'phone', KeyType: 'HASH'}
    ],
    AttributeDefinitions: [
      { AttributeName: 'phone', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  dynamodb.createTable(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to create table: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'Created table: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function deleteUsersTable() {
  var params = {
    TableName : 'enterTableNameToDelete'
  };

  dynamodb.deleteTable(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to delete table: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'Table deleted.';
    }
  });
}


// eslint-disable-next-line no-unused-vars
function listUsersTables() {
  var params = {};
  dynamodb.listTables(params, function(err, data) {
    if (err){
      document.getElementById('textarea').innerHTML = 'Unable to list tables: ' + '\n' + JSON.stringify(err, undefined, 2);
    }
    else{
      document.getElementById('textarea').innerHTML = 'List of tables: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
}


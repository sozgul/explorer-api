
/* global AWS, document, parsePhoneNumber, parseDisplayName */

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

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

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

function deleteUsersTable() {
  var params = {
    TableName : 'Users'
  };

  dynamodb.deleteTable(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to delete table: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'Table deleted.';
    }
  });
}



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


function createNewUser() {
  var newUserPhoneInfo = parsePhoneNumber();

  var params = {
    TableName :'Users',
    Item:{
      'phone': newUserPhoneInfo.phone,
      'phoneCountryCode': newUserPhoneInfo.countryCallingCode,
      'phoneIsValidNumber': newUserPhoneInfo.valid,
      'phoneVerificationStatus': 'pending',
      'country': newUserPhoneInfo.country
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to add item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'PutItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
}

function readUser() {
  var table = 'Users';
  var userPhoneInfo = parsePhoneNumber();

  var params = {
    TableName: table,
    Key:{
      'phone': userPhoneInfo.phone
    }
  };
  docClient.get(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to read item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'GetItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
}

function updateDisplayName() {
  var table = 'Users';
  var userPhoneInfo = parsePhoneNumber();
  var userDisplayName = parseDisplayName();

  var params = {
    TableName:table,
    Key:{
      'phone': userPhoneInfo.phone
    },
    UpdateExpression: 'set displayName = :dN',
    ExpressionAttributeValues:{
      ':dN':userDisplayName
    },
    ReturnValues: 'UPDATED_NEW'
  };

  docClient.update(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to update item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'UpdateItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
}

function deleteUser() {
  var table = 'Users';
  var userPhoneInfo = parsePhoneNumber();

  var params = {
    TableName:table,
    Key:{
      'phone': userPhoneInfo.phone
    }
  };
  docClient.delete(params, function(err, data) {
    if (err) {
      document.getElementById('textarea').innerHTML = 'Unable to delete item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.getElementById('textarea').innerHTML = 'DeleteItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
}

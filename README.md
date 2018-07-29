# explorer-api [![CircleCI](https://circleci.com/gh/CMUCloudComputing/explorer-api.svg?style=svg)](https://circleci.com/gh/CMUCloudComputing/explorer-api)

NodeJS REST API for the 'Explorer' project.  
- Relies on AWS DynamoDB.

## Getting Started in Development

### Pre-Requisites
- Install [NodeJS](https://nodejs.org/en/download/) *(version >= 8.x.x required)*
- Install [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

### Using with DynamoDB local version
- Config dynamoose by uncommenting the line `dynamoose.local('http://localhost:8000');`
- Config AWS endpoint to `http://localhost:8000` with any access keys or region.

### Using with AWS DynamoDB
- Make sure dynamoose isn't directed to local by removing `dynamoose.local('http://localhost:8000');`
- Config AWS endpoint region to `us-east-1` and URL to `https://dynamodb.us-east-1.amazonaws.com` 
- Config AWS credentials https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

### Installation
- `cd explorer-api`
- `npm install`

### Running the server
- `npm run start`
- The server will be running on http://localhost:8001

### Running Tests
- `npm run test`

## API Documentation

### Request Phone Verification
- URL: `/request-verification`
- Starts the phone number verification procedure
- If the phone number is valid, sends an SMS with verification Token using Twilio API 
- Parsed phone number format from liphonenumber library 'https://github.com/catamphetamine/libphonenumber-js'

#### Incoming HTTP Post request should include the following variable in format

phoneDetails: {
  carrierCode : undefined,
  country : "US",
  countryCallingCode : "1",
  ext : undefined,
  phone : "5559876543",
  possible : true,
  valid : true
}

#### Response format

Follows Twilio response format or error message


### Verify SMS Token
- URL: `/verify-token`
- Receives both phone information and SMS code input to use Twilio API for verification
- In result creates a new user in verified condition if successful

#### Incoming HTTP Post request should include the following variables in format

phoneDetails: {
  carrierCode : undefined,
  country : "US",
  countryCallingCode : "1",
  ext : undefined,
  phone : "5559876543",
  possible : true,
  valid : true
},
verificationToken: "1234"

#### Response format

{
  phone: "15559876543", 
  userid: "5610cae5-c0dc-49d5-b500-d0a4f698e9bd", 
  nationalPhoneNumber: "5559876543",
  countryCallingCode: "1", 
  phoneIsValidNumber: true, 
  phoneVerificationStatus: "verified", 
  country: "US"
}


### Create Draft Users (unverified)
- URL: `/users`
- Endpoint meant for development purposes when Twilio daily message limit is reached
- Creates an draft user in unverified condition

#### Incoming HTTP Post request should include the following variable in format

phoneDetails: {
  carrierCode : undefined,
  country : "US",
  countryCallingCode : "1",
  ext : undefined,
  phone : "5559876543",
  possible : true,
  valid : true
}

#### Response format

{
  phone: "15559876543", 
  userid: "5610cae5-c0dc-49d5-b500-d0a4f698e9bd", 
  nationalPhoneNumber: "5559876543",
  countryCallingCode: "1", 
  phoneIsValidNumber: true, 
  phoneVerificationStatus: "unverified", 
  country: "US"
}


### Search for User with Phone Number
- URL: `/search`
- Lookup user records via phone number
- Full phone number <CountryCode> + <NationalNumber> is used for lookup

#### Incoming HTTP Post request should include the following variable in format

phoneDetails: {
  carrierCode : undefined,
  country : "US",
  countryCallingCode : "1",
  ext : undefined,
  phone : "5559876543",
  possible : true,
  valid : true
}

#### Response format

{
  phone: "15559876543", 
  userid: "5610cae5-c0dc-49d5-b500-d0a4f698e9bd", 
  nationalPhoneNumber: "5559876543",
  countryCallingCode: "1", 
  phoneIsValidNumber: true, 
  phoneVerificationStatus: "verified", 
  country: "US",
  displayName: "Some Name"
}

### Update User Settings 
- URL: `/settings`
- Currently updates only display name

#### Incoming HTTP Post request should include the following variable in format

phoneDetails: {
  carrierCode : undefined,
  country : "US",
  countryCallingCode : "1",
  ext : undefined,
  phone : "5559876543",
  possible : true,
  valid : true
},
settings: {
  displayName: "New Display Name"
}

#### Response format

{
  phone: "15559876543", 
  userid: "5610cae5-c0dc-49d5-b500-d0a4f698e9bd", 
  nationalPhoneNumber: "5559876543",
  countryCallingCode: "1", 
  phoneIsValidNumber: true, 
  phoneVerificationStatus: "verified", 
  country: "US",
  displayName: "New Display Name"
}
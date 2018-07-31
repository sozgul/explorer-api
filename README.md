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

### Match phone's contacts to User accounts
- URL: `/match-contacts`
- Matches contacts on the user's device to user accounts in our DB.
- Full phone number <CountryCode> + <NationalNumber> is used for lookup

#### Incoming HTTP Post request should include the following variable in format

{
  contactDetailsList: [
    {
      contactId: "0a1b2-3c4c-d5e6-f7g8h9", 
      phoneNumbers: [
        {countryCallingCode: "1", phoneNumber: "5559876543"},
        ...
      ]
    },
    {
      contactId: "9j8i7-h6g5-f4e3d-2c1b0a",
      phoneNumbers: [
        {countryCallingCode: "1", phoneNumber: "4089218019"},
        {countryCallingCode: "1", phoneNumber: "4159712365"},
        ...
      ]
    },
    ...
  ]
}

#### Response format

{
  contactDetailsList: [
    {
      contactId: "0a1b2-3c4c-d5e6-f7g8h9", 
      userId: "5610cae5-c0dc-49d5-b500-d0a4f698e9bd"
    },
    {
      contactId: "9j8i7-h6g5-f4e3d-2c1b0a",
      userId: "b70d7e9b-ac0c-43e2-8713-420ba934bf16"
    },
    ...
  ]
}

### Update User Settings 
- URL: `/settings`
- Accepts either userid or phoneDetails to locate record to update
- One is enough, if both present it will use userid
- Currently updates only display name

#### Incoming HTTP Post request should include the following variable in format

userid: "5610cae5-c0dc-49d5-b500-d0a4f698e9bd",
settings: {
  displayName: "New Display Name"
}

or

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

### Check Refresh Token 
- URL: `/token`
- Requires refreshToken and userid to check validity
- If refresh token is valid, grants new access token and updates refresh token record

#### Incoming HTTP Post request should include the following variable in format

{
	"userid": "b70d7e9b-ac0c-43e2-8713-420ba934bf16",
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiJiNzBkN2U5Yi1hYzBjLTQzZTItODcxMy00MjBiYTkzNGJmMTYiLCJpYXQiOjE1MzMwMDg5OTQsImV4cCI6MTUzMzYxMzc5NH0.-vaZvkVXp7AsV8cY2NJ0NSSKBpUiGOeyvKVmPoO4Vnk"
}

#### Response format

(returns naked token)

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiJiNzBkN2U5Yi1hYzBjLTQzZTItODcxMy00MjBiYTkzNGJmMTYiLCJpYXQiOjE1MzMwMDkwMjAsImV4cCI6MTUzMzAwOTMyMH0.FrI-RjErXkN12BOU1Rdy-JmBSoQJBlLclSbmRd289BY

### Check Refresh Token 
- URL: `/token/reject`
- Requires only refresh token 
- If found deletes from record to invalidate token

#### Incoming HTTP Post request should include the following variable in format

{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI3YjhjMTQ1Yy0xNTk3LTQzZWUtODg3MC1lMTEyMDQ3YjNkMWMiLCJpYXQiOjE1MzMwMDk0ODcsImV4cCI6MTUzMzAwOTc4N30.gkU-DCPRvO6vLWHZL9-4wCVfLF6C8OO8-Zoy6X1TFOY"
}

#### Response format

Returns either error message or successful removal confirmation: "Refresh token revoked succesfully"


### Create Shared Map 
- URL: `/map`
- Requires a creatorID, subject title and a list of participants 
- Participants are referenced by userid and also have a role attached

#### Incoming HTTP Post request should include the following variable in format

{
	"creatorID": "2e91491e-a5ca-4def-ae0f-2d1e4186553a",
	"subject": "Sample Shared Map",
	"participants": [
		{
			"participantID": "2e91491e-a5ca-4def-ae0f-2d1e4186553a",
			"role": "admin"
		},
		{
			"participantID": "f7152483-f147-451e-9af6-833eb8e121e7",
			"role": "member"
		},
		{
			"participantID": "db734f3a-28ac-40b8-a710-de3f7fdc3a2b",
			"role": "member"
		}
	]
}

#### Response format

{
    "mapid": "d935a328-dd9c-4818-b7c1-b6af26e204b8",
    "creatorID": "2e91491e-a5ca-4def-ae0f-2d1e4186553a",
    "subject": "Test Map",
    "participants": [
        {
            "participantID": "2e91491e-a5ca-4def-ae0f-2d1e4186553a",
            "role": "admin"
        },
        {
            "participantID": "f7152483-f147-451e-9af6-833eb8e121e7",
            "role": "member"
        },
        {
            "participantID": "db734f3a-28ac-40b8-a710-de3f7fdc3a2b",
            "role": "member"
        }
    ],
    "createdAt": "2018-07-31T03:29:35.221Z",
    "updatedAt": "2018-07-31T03:29:35.221Z"
}
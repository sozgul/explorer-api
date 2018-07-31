require('dotenv').config();
require('./database');
const path = require('path');
const express = require('express');
const api = express();
const bodyParser = require('body-parser');
const {logger} = require('./logger');
const phoneVerificationController = require('./controllers/phoneVerification');
const usersController = require('./controllers/users');
const refreshTokensController = require('./controllers/refreshTokens');
const sharedMapsController = require('./controllers/sharedMaps');
const passport = require('passport');
const jwtStrategy  = require('./libs/passport/strategies/jwt');

passport.use(jwtStrategy);

api.use(bodyParser.json());                           // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({ extended: true }));   // to support URL-encoded bodies

// Phone Verification Endpoints

api.post('/request-verification', (req, res) => {
  logger.info('ExplorerAPI received request to /request-verification route');
  phoneVerificationController.requestPhoneVerification(req, res);
});

api.post('/verify-token', (req, res) => {
  logger.info('ExplorerAPI received request to /verify route');
  phoneVerificationController.verifyPhoneToken(req, res);
});

// User Endpoints

api.post('/search', function (req, res) {
  logger.info('Searching Users with phone details:');
  usersController.findUserWithPhone(req, res);
});

api.post('/match-contacts', function(req, res) {
  logger.info('Matching contacts from user\'s device to :');
  usersController.matchContactListToUserAccounts(req, res);
});

api.post('/settings', function (req, res) {
  logger.info('Updating user with received settings:');
  usersController.updateUserSettings(req, res);
});

// Refresh Token Endpoints

api.post('/token', function (req, res){
  logger.info('Checking the validity of the provided refresh token:');
  refreshTokensController.checkRefreshToken(req, res);
});

api.post('/token/reject', function (req, res) {
  logger.info('Revoking the provided refresh token:');
  refreshTokensController.revokeRefreshToken(req, res);
});

// Shared Map Endpoints

api.post('/map/', function (req, res) {
  logger.info('Received request to create shared map');
  sharedMapsController.createSharedMap(req, res);
});

// Development Endpoints

api.post('/users', (req, res) => {
  logger.info('Received request to create draft user');
  usersController.createDraftUser(req, res);
});

api.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).send('YAY! this is a protected Route');
});

api.use(express.static(path.join(__dirname, 'public')));

module.exports = api;

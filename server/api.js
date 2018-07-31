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


//passport stuff
const passport = require('passport');
const jwtStrategy  = require('./lib/passport/strategies/jwt');
passport.use(jwtStrategy);

api.use(bodyParser.json());                           // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({ extended: true }));   // to support URL-encoded bodies

api.post('/request-verification', (req, res) => {
  logger.info('ExplorerAPI received request to /request-verification route');
  phoneVerificationController.requestPhoneVerification(req, res);
});

api.post('/verify-token', (req, res) => {
  logger.info('ExplorerAPI received request to /verify route');
  phoneVerificationController.verifyPhoneToken(req, res);
});

api.post('/search', function (req, res) {
  logger.info('Searching Users with phone details:');
  usersController.findUserWithPhone(req, res);
});

api.post('/settings', function (req, res) {
  logger.info('Updating user with received settings:');
  usersController.updateUserSettings(req, res);
});

api.post('/token', function (req, res, next){
  logger.info('Checking the validity of the provided refresh token:');
  refreshTokensController.checkRefreshToken(req, res, next);
});

api.post('/token/reject', function (req, res, next) {
  logger.info('Revoking the provided refresh token:');
  refreshTokensController.revokeRefreshToken(req, res, next);
});

// This endpoint is for dev purposes
api.post('/users', (req, res) => {
  logger.info('ExplorerAPI received request to create draft user');
  usersController.createDraftUser(req, res);
});

// This endpoint is for dev purposes
api.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).send('YAY! this is a protected Route');
});

api.use(express.static(path.join(__dirname, 'public')));

module.exports = api;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const {logger} = require('./../../../logger');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'SUPER_SECRET_ACCESS_KEY'; //normally store this in process.env.secret

module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
  logger.info('jwt_payload');
  logger.info(jwt_payload);

  var expirationDate = new Date(jwt_payload.exp * 1000);
  if(expirationDate < new Date()) {
    return done(null, false);
  }
  var user = jwt_payload;
  return done(null, user);
}); 
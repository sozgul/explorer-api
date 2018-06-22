
const winston = require('winston');
const expressWinston = require('express-winston');
const LOG_LEVEL = 'info';

const logger = new winston.Logger({
  level: LOG_LEVEL,
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true,
      level: 'debug',
      handleExceptions: true
    })
  ]
});

const expressLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  expressFormat: true,
  colorize: false
});

module.exports = {
  logger,
  expressLogger
};


const {parsed: config = {}} = require('dotenv').config();
const PORT = config.NODE_ENV === 'production' ? 8000 : 8001;
const api = require('./api');
const {logger, expressLogger} = require('./logger');

api.use(expressLogger);

api.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

api.listen(PORT, () => {
  logger.info(`ExplorerAPI is listening on port ${PORT}`);
});

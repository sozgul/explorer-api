
const PORT = 8001;
const api = require('./api');
const bodyParser = require('body-parser');
const {logger, expressLogger} = require('./logger');

api.use(bodyParser.json());                           // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({ extended: true }));   // to support URL-encoded bodies
api.use(expressLogger);

api.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

api.listen(PORT, () => {
  logger.info(`ExplorerAPI is listening on port ${PORT}`);
});

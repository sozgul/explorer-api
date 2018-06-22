
const PORT = 8000;
const api = require('./api');
const bodyParser = require('body-parser')
const {logger, expressLogger} = require('./logger');

api.use(bodyParser.json());
api.use(expressLogger);

api.listen(PORT, () => {
  logger.info(`ExplorerAPI is listening on port ${PORT}`);
});

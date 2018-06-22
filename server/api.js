const express = require('express');
const api = express();

api.get('/', (req, res) => {
  res.status(200).send('ExplorerAPI is running');
});

module.exports = api;

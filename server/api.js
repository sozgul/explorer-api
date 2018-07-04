const express = require('express');
const path = require('path');
const api = express();


api.post('/users', (req, res) => {
  console.log('ExplorerAPI is received posty request to /users route');
  res.status(200).send('ExplorerAPI is received posty request to /users route');
});

api.use(express.static(path.join(__dirname, 'public')));



// api.get('/', (req, res) => {
//   res.status(200).send('ExplorerAPI is running');
// });

module.exports = api;

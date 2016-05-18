
require('babel-core');  
 

var express = require('express'),
  config = require('./config/config'),
  db = require('./models/index');

var app = express();

require('./config/express').default(app, config);

db.sequelize
  .sync()
  .then(function () {
    app.listen(config.serverPort, function () {
      console.log('Express server listening on port ' + config.serverPort);
    });
  }).catch(function (e) {
    throw new Error(e);
  });

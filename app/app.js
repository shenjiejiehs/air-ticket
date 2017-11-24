var express = require('express');
var boot = require('express-app-boot')(__dirname);

var crossDomain = require('./middleware/crossDomain');
var deviceInfo = require('./middleware/deviceInfo');
var clientAuth = require('./middleware/clientAuth');
var envSettings = require('./middleware/envSettings');
var urlBase = require('./middleware/urlBase.js')();

var app = express();

boot(app, 'boot').beforeStart(function(app) {
  app.use(urlBase);
  app.use(crossDomain);
  app.use(envSettings);
  app.use(clientAuth);
  app.use(deviceInfo);
});

module.exports = app;

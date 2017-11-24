var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

module.exports = function parser(app) {
  app.use(bodyParser.json({
    limit: '20mb'
  }));
  app.use(bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  }));
  app.use(cookieParser());
};

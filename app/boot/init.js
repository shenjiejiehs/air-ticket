var loggerMiddleware = require('./logger').normal;


module.exports = function init(app) {
  app.enable('trust proxy');
  app.disable('x-powered-by');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  app.use(loggerMiddleware);

};

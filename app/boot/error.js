/* eslint no-unused-vars: 0 */
var loggerMiddleware = require('./logger').error;
var cleanup = require('./cleanup');
module.exports = function(app) {
  app.use(handleMongoError);
  app.use(loggerMiddleware);

  // var env = process.env.ENV || 'dev';
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next({
      status: 404
    });
  });

  // error handlers
  // development error handler
  // will print stacktrace
  if (app.get('env') == 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to use
  app.use(function(err, req, res, next) {
    if (err.stack) {
      console.error('express unhandled error ==>', err);
      console.error(err.stack);
    }
    console.log('Referer: ', req.get('referer') || 'none');
    console.log('UA: ', req.get('user-agent'));
    console.log('IP: ', req.ip);
    var staticBase = './';
    var depth = req.originalUrl.split('/').length - 1;
    if (depth > 1) {
      staticBase = (new Array(depth)).join('../');
    }
    if (res.headersSent) {
      return;
    }
    res.status(err.status || 500);
    if (res.statusCode == 404) {
      res.render('404', {
        url_base: staticBase
      });
    } else {
      res.render('error', {
        message: err.message,
        error: err
      });
    }
  });
};

function handleMongoError(err, req, res, next) {
  if ((err instanceof Error) & err.name === 'MongoError') {
    //start uncaughtException process
    cleanup(req.app);
    console.error('[MongoException]: %s\nErrorStack: \n%s', err, err.stack);
    setTimeout(function() {
      process.exit(1);
    }, 100);
    return;
  }

  return next(err);
}

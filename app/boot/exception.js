var cleanup = require('./cleanup');

module.exports = function(app){
  process.on('uncaughtException', onException);
  process.on("unhandledRejection", function(err){
    console.error('[unhandledPromiseRejection]: %s\nErrorStack: \n%s', err, err.stack);
  });

  process.on('SIGINT', function(){
    cleanup(app);
    setTimeout(function(){
      process.exit(0);
    }, 100);
  });

  function onException(err){
    cleanup(app);
    console.error('[unhandledException]: %s\nErrorStack: \n%s', err, err.stack);
    setTimeout(function(){
      process.exit(1);
    }, 100);
  }
};
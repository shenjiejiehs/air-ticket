var loggerMiddleware = require('express-bunyan-logger2');
var valByKeypath = require('../common/l/valByKeypath');
var clone = require('../common/l/clone');
var getValBySynonym = require('../utils/getValBySynonym');
var merge = require('merge');

var defaultOptions = {
  name: process.env.APP_NAME || 'web-app',
  excludes: ['*', '!body', '!status-code' /*, '!req-headers', '!res-headers'*/ ],
  includesFn: function(req /*, res*/ ) {
    var sess = valByKeypath('session', req),
      sessId;
    if (sess) {
      sessId = sess.id;
      sess = Object.keys(sess).reduce(function(m, k) {
        if (k !== 'cookie') {
          m[k] = sess[k];
        }
        return m;
      }, {});
      sess.sessionId = sessId;
    }
    return {
      session: sess
    };
  },
  format: ':method :url\nreferer :referer\n:user-agent[family]/:user-agent[major] :status-code :response-time ms - :res-headers[content-length]\n'
};

var envOpts = merge(defaultOptions, getValBySynonym({
  'dev': {
    color: {
      'response-time': function(resTime) {
        return resTime < 200 ? 'green' : 'red';
      }
    },
    src: true,
    level: 'trace'
  },
  'prod': {
    level: 'info'
  },
  'test': {
    color: true
  }
}, process.env.NODE_ENV || 'dev'));

var options = clone(envOpts);

if (process.env.LOGGER_LEVEL) {
  options.level = process.env.LOGGER_LEVEL;
}


module.exports = {
  normal: loggerMiddleware(options),
  error: loggerMiddleware.errorLogger(options),
  config: config
};

function config(opt) {
  var _opt = merge({}, envOpts, opt);
  return {
    normal: loggerMiddleware(_opt),
    error: loggerMiddleware.errorLogger(_opt)
  };
}

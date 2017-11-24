var request = require('utils/request');
var url = require('url');
var mapRecursive = require('common/l/mapRecursive');
var valByKeypath = require('common/l/valByKeypath');
var type = require('common/type');
var logQueue = [];
var MAX_CACHE_LENGTH = 20;
var SEND_LEVEL = 'warn';

// "fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
// "error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
// "warn" (40): A note on something that should probably be looked at by an operator eventually.
// "info" (30): Detail on regular operation.
// "debug" (20): Anything else, i.e. too verbose to be included in "info" level.

var level_weight = {
  'debug': 20,
  'info': 30,
  'warn': 40,
  'error': 50,
  'fatal': 60
};

var logger = module.exports = {
  debug: makeLoggerFn('debug'),
  info: makeLoggerFn('info'),
  warn: makeLoggerFn('warn'),
  error: makeLoggerFn('error'),
  fatal: makeLoggerFn('fatal')
};

//handle window.onerror

var oldOnError = window.onerror;

window.onerror = function(msg, url, lines, col, e) {
  if(lines == 1&&!/\/m\?m=/.test(url)){
    //drop the ios client bug
    return;
  }
  var err = e || {};
  err.msg = msg;
  err.url = url;
  err.lines = lines;
  err.col = col;

  if(typeof oldOnError === 'function'){
    oldOnError(msg, url, lines, col, e);
  }

  logger.error(err, 'client uncaught error');
};

var timer;

function makeLoggerFn(level) {
  var send_level_weight = level_weight[SEND_LEVEL];
  var cur_level_weight = level_weight[level];
  return function log(obj, msg) {
    if (timer) {
      clearTimeout(timer);
    }
    if (arguments.length < 2) {
      msg = obj;
      obj = {};
    }

    var logData = {
      l: level,
      d: normalizeLogData(obj),
      m: msg
    };

    // output for debug
    (console[level] || console.log).call(console, '['+level+']:' + msg);
    console.log(obj);

    logQueue.push(logData);

    //reclaim memory when logQueue grow too long
    if (logQueue.length > 200) {
      logQueue = logQueue.slice(logQueue.length - MAX_CACHE_LENGTH);
    }

    if (cur_level_weight >= send_level_weight || valByKeypath('process.env.NODE_ENV', window) === 'development') {
      timer = setTimeout(function() {
        var startIdx = MAX_CACHE_LENGTH >= logQueue.length ? 0 : logQueue.length - MAX_CACHE_LENGTH;
        request({
          url: url('/log'),
          method: 'post',
          type: 'json',
          data: logQueue.slice(startIdx)
        });
        logQueue.length = 0;
        timer = null;
      }, 200);
    }
  };
}

function normalizeLogData(obj) {
  obj = stringifyError(obj);
  if (!type.isObject(obj)) {
    obj = {
      logData: obj
    };
  }

  if (!obj.url) {
    obj.url = window.location.href;
  }
  return obj;
}

function stringifyError(obj) {
  return mapRecursive(function(e) {
    if (e instanceof Error) {
      var rtn = Object.keys(e).reduce(function(m, k) {
        m[k] = e[k];
        return m;
      }, {});
      rtn.stack = e.stack;
      return rtn;
    }
    return e;
  }, obj);
}

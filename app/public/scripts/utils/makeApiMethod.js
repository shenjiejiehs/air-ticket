var Promise = require('utils/promise/timeout');
var request = require('utils/request');
var url = require('url');
var REQUEST_TIMEOUT = 60 * 1000; //60 seconds
var tracker = require('utils/tracker');

function _makeApiMethod(apiUrl, httpMethod) {
  httpMethod = httpMethod || 'GET';
  apiUrl = url(apiUrl);
  return function(params, onData) {
    tracker.startTiming('ajax_request', httpMethod, apiUrl);
    var requestPromise = request({
      url: apiUrl,
      method: httpMethod,
      data: params
    });

    return Promise.timeout(REQUEST_TIMEOUT, requestPromise)
      .then(function(result) {
        if (typeof onData === 'function') {
          result = onData(result);
        }
        tracker.endTiming('ajax_request', httpMethod, apiUrl);
        return result;
      })['catch'](function(err) {
        if(err && err.promiseTimeout){
          err = {
            error: {
              msg: '请求超时',
              origin: err
            }
          };
        }

        console.log('[api falied]' + apiUrl + ':');
        console.log(err.error);
        tracker.endTiming('ajax_request', httpMethod, apiUrl);
        tracker.track('ajax_error', err.error && err.error.msg || ({}).toString.call(err), apiUrl);

        throw err;
      });
  };
}

module.exports = _makeApiMethod;

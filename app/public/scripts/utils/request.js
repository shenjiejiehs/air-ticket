var ajax = require('./request/ajax');
var Promise = require('utils/promise');
var assert = require('common/assert');
/*
 * @param xhrOptions Object =>{
 *  url: String, //required
 *  method: get|post,
 *  data: (accordingly),
 *  type: json(default)|form|text|html|xml,
 *  jsonp: false(default)|true,
 *  callbackKey: String, //only used when jsonp is true
 *  callbackMethodName: String, //used when jsonp is true
 *  headers: {
 *    'key': 'value'
 *  },
 *  withCredentials: true|false(default),
 *  extractResponse: true(default)|false,
 *  config: function(xhr){...} // invoked before "xhr.send"
 * }
 * @return promise
 */
function request(xhrOptions) {
  xhrOptions = xhrOptions || {};
  assert(typeof xhrOptions.url === 'string', '[Ajax request]Invalid url option!');

  var abortFn;
  var reqPromise =  new Promise(
    function(resolve, reject) {
      var xhr;
      xhrOptions.method = (xhrOptions.method || 'GET').toUpperCase();
      xhrOptions.onsuccess = resolve;
      xhrOptions.onerror = reject;
      xhr = ajax(xhrOptions);
      abortFn = function(){
        xhr.abort();
        var err = new Error('request canceled!');
        err.statusText = 'abort';
        err.status = 0;
        reject(err);
      };
    }
  );

  reqPromise.abort = abortFn;

  return reqPromise;
}
module.exports = request;


var qs = require('../queryString');
var getXHR = require('./getXHR');
var type = require('common/type');
var each = require('common/l/each');

function ajax(options) {
  if (options.jsonp) {
    return handleJsonp(options);
  } else {
    return handleXHR(options);
  }
}

module.exports = ajax;

function handleJsonp(options) {
  var callbackKey = options.callbackName || '__callback__' + new Date().getTime() + '_' + (Math.round(Math.random() *
    1e16)).toString(36);
  var doc = window.document;
  var script = doc.createElement('script');

  window[callbackKey] = function(resp) {
    script.parentNode.removeChild(script);
    options.onsuccess({
      status: 200,
      response: resp
    });
    window[callbackKey] = undefined;
  };

  script.onerror = function() {
    var err = new Error('Error making jsonp request');
    err.status = 500;
    script.parentNode.removeChild(script);

    options.onerror(err);
    window[callbackKey] = undefined;

    return false;
  };

  script.onload = function() {
    return false;
  };
  options = bindData(options);
  script.src = options.url + (options.url.indexOf('?') > 0 ? '&' : '?') + (options.callbackKey ? options.callbackKey :
    'callback') + '=' + callbackKey;
  doc.body.appendChild(script);
  return {
    abort: function() {}
  };
}

function handleXHR(options) {
  var xhr = getXHR();
  if (xhr === false) {
    throw new Error('XMLHttpRequest is not supported!');
  }

  options = bindData(options);

  xhr.open(options.method, options.url, true, options.user, options.password);

  onXHRLoad(xhr, function onload(e) {

    options['on' + e.type](e.target);
  }, options);

  setRequestHeaders(xhr, options);

  //handle withCredetials
  if (options.withCredentials) {
    xhr.withCredentials = true;
  }

  if (typeof options.config === 'function') {
    var maybeXhr = options.config(xhr, options);
    if (maybeXhr != null) xhr = maybeXhr;
  }

  var data = options.data == null ? null : options.data;
  if (data && (type(data) !== 'string' && data.constructor !== window.FormData)) {
    throw 'Request data should be either be a string or FormData.';
  }
  xhr.send(data);
  return xhr;
}

//helpers
function onXHRLoad(xhr, onload, options) {
  xhr.onreadystatechange = function() {
    if (4 !== xhr.readyState) {
      return;
    }
    var evt;
    if (xhr.status >= 200 && xhr.status < 300) {
      evt = options.extractResponse === false ? {
        type: 'success',
        target: xhr
      } : extractResponse(xhr, options);
    } else {
      evt = options.extractResponse === false ? {
        type: 'error',
        target: xhr
      } : {
        type: 'error',
        target: (function(xhr) {
          var err = new Error('[XMLHttpRequest error]' + (xhr.statusText || 'Unsuccessful HTTP response'));
          err.status = xhr.status;
          err.error = extractResponse(xhr, options, 'error').target;
          return err;
        })(xhr)
      };
    }

    onload(evt);

  };
  return xhr;
}


function bindData(options) {
  var prefix, queryString;
  if (options.method === 'GET' || options.jsonp) {
    options.url = parameterizeUrl(options.url, options.data);

    prefix = options.url.indexOf('?') < 0 ? '?' : '&';
    queryString = qs.build(options.data);
    options.url = options.url + (queryString ? prefix + queryString : '');
    delete options.data;
  } else {
    options.data = serialize(options);
  }
  return options;
}

function parameterizeUrl(url, data) {
  var tokens = url.match(/:[a-z]\w+/gi);
  if (tokens && data) {
    for (var i = 0, l = tokens.length; i < l; i++) {
      var key = tokens[i].slice(1);
      url = url.replace(tokens[i], data[key]);
      delete data[key];
    }
  }
  return url;
}

function serialize(options) {
  var type = options.type || 'json';
  var data = options.data || '';
  var result;
  switch (type) {
    case 'form':
      result = qs.build(data);
      break;
    case 'json':
      try {
        result = JSON.stringify(data);
      } catch (e) {
        console.error('[ajax serialize]json stringify error:\n' + e);
        result = null;
      }
      break;
    default:
      result = data;
  }

  return result;
}

function setRequestHeaders(xhr, options) {
  var type = options.type || 'json';
  var headers = options.headers || {};
  var contentType = {
    'html': 'text/html',
    'xml': 'application/xml',
    'text': 'text/*',
    'form': 'application/x-www-form-urlencoded; charset=utf-8',
    'json': 'application/json; charset=utf-8'
  }[type];
  if (type === 'json') {
    xhr.setRequestHeader('Accept', 'application/json, text/*');
  }
  if (contentType) {
    xhr.setRequestHeader('Content-Type', contentType);
  }

  each(function(v, k) {
    xhr.setRequestHeader(k, v);
  }, headers);
}

function extractResponse(xhr, options, extractType) {
  extractType = extractType || 'success';
  var ctype = _getCType(xhr);
  var dataType = options.type || 'json';
  if (xhr.responseType === 'json' && xhr.response != null) {
    return {
      type: extractType,
      target: xhr.response
    };
  }

  try {
    if (/json/i.test(ctype) || xhr.responseType === 'json' || dataType === 'json') {
      return {
        type: extractType,
        target: xhr.responseText ? JSON.parse(xhr.responseText) : undefined
      };
    }

    if (/x-www-form-urlencoded/i.test(ctype)) {
      return {
        type: extractType,
        target: qs.parse(xhr.responseText)
      };
    }

    return {
      type: extractType,
      target: xhr.responseText
    };
  } catch (e) {
    var err = new Error('[XMLHttpRequest error]extract response failed');
    err.original = e;
    return {
      type: 'error',
      target: err
    };
  }

}

function _getCType(xhr) {
  var contentType = xhr.getResponseHeader('content-type') || '';
  return contentType.split('/ *; */').shift() || 'unknown';
}

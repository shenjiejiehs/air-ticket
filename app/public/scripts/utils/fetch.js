const hookRedraw = require('./hookRedraw');

/**
 * Fetch polyfill
 * https://github.com/developit/unfetch
 */
let fetch = function(url, options) {
  options = options || {};
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();

    request.open(options.method || 'get', url);

    for (let i in options.headers) {
      request.setRequestHeader(i, options.headers[i]);
    }

    request.withCredentials = options.credentials == 'include';

    request.onload = () => {
      resolve(response());
    };

    request.onerror = reject;

    request.send(options.body);

    function response() {
      let keys = [], all = [], headers = {}, header;

      request
        .getAllResponseHeaders()
        .replace(/^(.*?):\s*([\s\S]*?)$/gm, (m, key, value) => {
          keys.push((key = key.toLowerCase()));
          all.push([key, value]);
          header = headers[key];
          headers[key] = header ? `${header},${value}` : value;
        });

      return {
        ok: (request.status / 200 | 0) == 1, // 200-399
        status: request.status,
        statusText: request.statusText,
        url: request.responseURL,
        clone: response,
        text: () => Promise.resolve(request.responseText),
        json: () => Promise.resolve(request.responseText).then(JSON.parse),
        xml: () => Promise.resolve(request.responseXML),
        blob: () => Promise.resolve(new Blob([request.response])),
        headers: {
          keys: () => keys,
          entries: () => all,
          get: n => headers[n.toLowerCase()],
          has: n => n.toLowerCase() in headers
        }
      };
    }
  });
};

fetch = hookRedraw(fetch);

module.exports = fetch;

module.exports.get = (url, data) =>
  fetch(url + stringify(data), { method: 'GET' });

module.exports.post = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

function stringify(object) {
  if (object == null) return '';
  const qs = Object.keys(object)
    .map(key => `${key}=${encodeURIComponent(object[key])}`)
    .join('&');
  return qs === '' ? '' : '?' + qs;
}

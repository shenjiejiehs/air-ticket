var assert = require('common/assert');
var decodeURLComponents = require('./globals').decodeURLComponents;
function ensurePreSlash(path) {
  assert(typeof path === 'string', '[ensurePreSlash]invalid parameter "path"! given:' + path);
  return '/' !== path[0] ? '/' + path : path;
}

function decodeURLEncodedURIComponent(val) {
  if (typeof val !== 'string') {
    return val;
  }
  return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
}
module.exports = {
  ensurePreSlash: ensurePreSlash,
  decodeURLEncodedURIComponent: decodeURLEncodedURIComponent
};

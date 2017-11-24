var type = require('common/type');
var slice = require('common/slice');
var mapObject = require('common/l/mapObject');

function memoizeFacetsFn(facets) {
  return mapObject(function(v, n) {
    if (type(v) !== 'array' || type(v[v.length - 1]) !== 'function') {
      throw new TypeError('[createStore.addFacets]Invalid facet property value of "'+n+'"! Should be an array with the last item to be a function.');
    }
    v[v.length - 1] = _memoizeByRefs(v[v.length - 1]);
    return v;
  }, facets);
}

function _memoizeByRefs(fn) {
  var cache = [];
  return function _memoized() {
    var args = slice(arguments);
    if (!_equalWithCache(args, cache)) {
      cache = args.slice();
      cache.push(fn.apply(this, args));
    }
    return cache[cache.length - 1];
  };
}

function _equalWithCache(args, cache) {
  var argsLen = args.length,
    cacheLen = cache.length;
    if (argsLen !== cacheLen - 1) {
      return false;
    }
    for (var i = 0; i < argsLen; i++) {
      if (args[i] !== cache[i]) {
        return false;
      }
    }
    return true;
}

module.exports = memoizeFacetsFn;

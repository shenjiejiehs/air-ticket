var type = require('common/type');

function buildQueryString(object, prefix) {
  if(type(object) !== 'object'){
    object = {};
  }
  var duplicates = {};
  var str = [];
  Object.keys(object).forEach(function(prop) {
    var key = prefix ? prefix + "[" + prop + "]" : prop;
    var value = object[prop];
    var valueType = type(value);
    var pair = (value === null) ? encodeURIComponent(key) :
      valueType === 'object' ? buildQueryString(value, key) :
      valueType === 'array' ? value.reduce(function(memo, item) {
        if (!duplicates[key]) duplicates[key] = {};
        if (!duplicates[key][item]) {
          duplicates[key][item] = true;
          return memo.concat(encodeURIComponent(key) + "=" + encodeURIComponent(item));
        }
        return memo;
      }, []).join("&") :
      encodeURIComponent(key) + "=" + encodeURIComponent(value);
    if (value !== undefined) str.push(pair);
  });
  return str.join("&");
}

function parseQueryString(str) {
  if (str.charAt(0) === "?") str = str.substring(1);

  var pairs = str.split("&").filter(function(s){return s.trim() !== '';}),
    params = {};
  for (var i = 0, len = pairs.length; i < len; i++) {
    var pair = pairs[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = pair.length == 2 ? decodeURIComponent(pair[1]) : null;
    if (params[key] != null) {
      if (type(params[key]) !== 'array') params[key] = [params[key]];
      params[key].push(value);
    } else {
      params[key] = value;
    }
  }
  return params;
}

module.exports = {
  build: buildQueryString,
  parse: parseQueryString
};

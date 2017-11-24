var m = require('m-react');
var slice = require('common/slice');
var SPLITER = '|';

function makeSuffixClsNameM(cm) {
  function $m(tag) {
    var restArgs = slice(arguments, 1),
      parts, regularPart, suffixedPart;
    if (typeof tag !== 'string' || tag.indexOf(SPLITER) === -1) {
      return m.apply(m, [tag].concat(restArgs));
    }

    parts = tag.split(SPLITER);
    regularPart = (parts[0] || '').trim();
    suffixedPart = (parts[1] || '').trim();
    return m.apply(m, [regularPart + suffixCls(suffixedPart, cm)].concat(restArgs));
  }

  Object.keys(m).forEach(function(key){
    $m[key] = m[key];
  })
  return $m;
}

module.exports = makeSuffixClsNameM;

function suffixCls(str, cm){
  var clsNames = str.trim().split('.').filter(Boolean);
  return clsNames.map(function(cls){
    return '.'+cm(cls);
  }).join('');
}

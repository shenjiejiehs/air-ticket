var mapRecursive = require('../common/l/mapRecursive');
var type = require('../common/type');

var MAX_LENGTH = 1000;

//对字符串类型的值，超过1000个字符就进行截取
module.exports = mapRecursive(function (v){
  return type.isString(v) ? v.substring(0, MAX_LENGTH) : v;
});
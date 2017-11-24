// var assert = require('assert');

module.exports = function svgWrapper( /*options*/ ) {
  //var depName = options.depName;
  // assert(typeof depName === 'string' && !!depName.trim(), '[svgWrapper]invalid options, depName is needed!');
  return {
    filter: 'svg',
    transformer: function(fileObj, modId) {
      return {
        path: fileObj.path,
        content: 'define("' + modId + '", function(){return "' + toJsStr(fileObj.content) + '";});'
      };
    }
  };
};

function toJsStr(jsCode) {
  return jsCode.replace(/\\/g, '\\\\').replace(/"/g, '\\\"').replace(/'/g, '\\\'').replace(/\s*(\n|\r|\r\n)\s*/g, '');
}
var compile = require('regenerator').compile;
var genOrAsyncFunExp = /\bfunction\s*\*|\basync\b/;
var STRIP_COMMENTS = /(^\s*(\/\/.*$))|(\/\*[\s\S]*?\*\/)/mg;
var cfg = require('./config');
var pUtil = require('path');

module.exports = function(/*options*/){
  return {
    filter: function(fileObj){
      var isJS = pUtil.extname(fileObj.path) === '.js';
      return isJS && !endWith(fileObj.path, 'transformers/regenerator/runtime.js') && !endWith(fileObj.path, 'transformers/regenerator/runtime.min.js');
    },
    transformer: function(fileObj){
      var noCommentContent = fileObj.content.replace(STRIP_COMMENTS, '');
      var content = genOrAsyncFunExp.test(noCommentContent) ? 'var regeneratorRuntime = require(\'regenerator-runtime\');\n' + compile(fileObj.content, cfg).code : fileObj.content;
      if(genOrAsyncFunExp.test(noCommentContent))console.log(fileObj.path);
      return {
        path: fileObj.path,
        content: content
      };
    }
  };
};

function endWith(s, end){
  return s.lastIndexOf(end) === s.length - end.length;
}

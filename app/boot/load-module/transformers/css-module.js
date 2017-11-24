var pUtil = require('path');
var util = require('express-module-serv/lib/util');
var merge = require('merge');
var resourceUrlReg = /(url\(\s*['"]?)([^)'"]+)(['"]?\s*\))/g;
var postcss = require('postcss');


var wrapCSS = function(options) {
  options = merge({
    pattern: /\.m\.css$/i
  }, options);
  if (!options.routePath) options.routePath = './';

  return {
    filter: 'css',
    transformer: function _wrapCSS(fileObj, modId) {
      var isCSSModule = options.pattern ? options.pattern.test(fileObj.path) : false;
      var css = resolveResourceUrl(fileObj, options), content;
      if(isCSSModule){
        var id = util.stringHash(modId);
        return postcss([require('postcss-modules')({
          getJSON: function(){},
          generateScopedName: function(name){
            return '_'+name+'_'+id;
          }
        })])
        .process(css)
        .then(function(result){
          var content = 'define(\'' + modId + '\',[\'addStyle\'],function(a){a("' + util.toJsStr(result.css) + '"); return function(n){return "_"+n+"_'+id+'";};});';
          return {
            path: fileObj.path,
            content: content
          };
        });
      }else{
        content = 'define(\'' + modId + '\',[\'addStyle\'],function(a){a("' + util.toJsStr(css) + '");});';
        return {
          path: fileObj.path,
          content: content
        };
      }
    }
  };
};



function resolveResourceUrl(fileObj, options) {
  var cssPath = fileObj.path,
    content = fileObj.content,
      staticPath = options.staticPath,
        routePath = options.routePath;
        if (!staticPath) return content;
        return content.replace(resourceUrlReg, function(m, open, url, close) {
          if (!util.isRelativeUrl(url)) {
            return m;
          }
          return open + _resolveUrl(url, cssPath, staticPath, routePath) + close;
        });
}

function _resolveUrl(url, cssPath, staticPath, routePath) {
  var resourcePath = pUtil.resolve(pUtil.dirname(cssPath), url);
  var result = util.unixfy(pUtil.join(routePath, pUtil.relative(staticPath, resourcePath)));
  if (result.charAt(0) === '/') result = util.unixfy(pUtil.join('.', result));
  return result;
}

module.exports = wrapCSS;


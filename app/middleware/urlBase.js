var url = require('url');
var pathUtil = require('path');
var merge = require('merge');
module.exports = function(localVarName) {
  localVarName = ensureString(localVarName) || 'url_base';
  return function(req, res, next) {
    var originRender = res.render.bind(res);
    var pathname = ensureString(
      url.parse(ensureString(req.originalUrl)).pathname
    );
    var currentPathToApp = pathUtil.join(req.baseUrl, req.path);
    currentPathToApp = currentPathToApp
      .split(/[\/\\\s]+/)
      .filter(function(p) {
        return !!p;
      })
      .map(function() {
        return '..';
      });
    if ('/' !== pathname[pathname.length - 1]) {
      currentPathToApp.pop();
    }
    res.render = function(viewPath, locals, callback) {
      locals = merge({}, locals);
      locals[localVarName] = currentPathToApp.length
        ? currentPathToApp.join('/') + '/'
        : './';
      return originRender(viewPath, locals, callback);
    };
    next();
  };
};

function ensureString(str) {
  return 'string' === typeof str ? str : '';
}

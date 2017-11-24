var pathToRegexp = require('./parser');

function Route(path) {
  this.path = (path === '*') ? '(.*)' : path;
  this.keys = [];
  this.regexp = pathToRegexp(this.path, this.keys);

}

var proto = Route.prototype;
proto.middleware = function(fn) {
  var self = this;
  return function(ctx, next) {
    if (self.match(ctx.pathname, ctx.params)) {
      return fn(ctx, next);
    }

    next();
  };
};

proto.match = function(path, params) {
  var keys = this.keys, key, i, l, val,
    m = this.regexp.exec(decodeURIComponent(path));
  if (!m) {
    return false;
  }

  for(i = 1, l = m.length; i < l; i++){
    key = keys[i-1];
    val = decodeURIComponent(m[i]);
    if(val !== 'undefined'){
      params[key.name] = val;
    }
  }
  return true;
};


module.exports = Route;

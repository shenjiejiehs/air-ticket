var SwitchLatestPromise = require('../switchLatestPromise');
var memoize = require('common/fn/memoize');
var slice = require('common/slice');

module.exports = memoize(function latest(fn){
  var slp = new SwitchLatestPromise();
  return function $latest(){
    var args = slice(arguments);
    var context = this;
    var resolver = slp.getResolver();
    slp.addTask(fn.apply(context, args));
    return resolver;
  };
});

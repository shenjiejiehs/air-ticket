var Promise = require('../promise');

Promise.delay = function(delay, promise){
  return new Promise(function(resolve){
    setTimeout(function(){
      resolve(promise);
    }, delay);
  });
};

module.exports = Promise;

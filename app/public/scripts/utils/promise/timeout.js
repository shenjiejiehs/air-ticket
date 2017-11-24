define('utils/promise/timeout',['utils/promise'], function(Promise){
  Promise.timeout = function(timeout, promise){
    return new Promise(function(resolve, reject){
      var timeoutId = setTimeout(function(){
        var err = new Error('[promise]: timeout!');
        err.promiseTimeout = true;
        reject(err);
      }, timeout);
      promise.then(function(result){
        clearTimeout(timeoutId);
        resolve(result);
      },
      function(err){
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  };
  return Promise;
});
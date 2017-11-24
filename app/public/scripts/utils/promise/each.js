define('utils/promise/each',['utils/promise'],function(Promise){
  Promise.each = function(promises, processFn) {
    return promises.reduce(function(seq, promise) {
      return seq.then(function() {
        return promise;
      }).then(processFn);
    }, Promise.resolve());
  };
  return Promise;
});
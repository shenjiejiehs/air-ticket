var assert = require('common/assert');
module.exports = function createObservable(initVal) {
  var listeners = [];
  var value = initVal;

  var observable = function(val, isTrigger) {
    if (arguments.length > 0) {
      if (val !== value) {
        value = val;
        if(isTrigger !== false){
          triggerListeners(listeners, value);
        }
      }
      return;
    }
    return value;
  };

  observable.on = function(listener){
    assert(typeof listener === 'function', '[observable.on] Invalid listener!'+ listener);
    if(listeners.indexOf(listener) === -1){
      listeners.push(listener);
    }

    return function remove(){
      var idx = listeners.indexOf(listener);
      if(idx !== -1){
        listeners.splice(idx, 1);
      }
    };
  };

  return observable;
};

//helpers
function triggerListeners(listeners, value){
  var i = 0, l = listeners.length;
  for(; i < l; i++){
    listeners[i](value);
  }
}

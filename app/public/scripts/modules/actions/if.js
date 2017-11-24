var Promise = require('utils/promise');

function isThenable(o) {
  return o && typeof o.then === 'function';
}

module.exports = function $action_if(predicate, actionHandler) {
  return function if_action(ctrl, next, input) {
    var condition = predicate(ctrl, input);
    if (isThenable(condition)) {
      Promise.resolve(condition).then(function(result) {
        if (!!result) {
          actionHandler(ctrl, next, input);
        }
      });

    } else {
      !!condition && actionHandler(ctrl, next, input);
    }
  };
};

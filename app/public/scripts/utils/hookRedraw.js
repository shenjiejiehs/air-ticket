const m = require('m-react');

const redraw = () => m.redraw();

module.exports = function hookRedraw(fn) {
  return function() {
    let count = 0;
    try {
      const result = fn.apply(null, arguments);
      if (result && typeof result.then === 'function') {
        return finalize(result);
      } else {
        redraw();
        return result;
      }
    } catch (e) {
      redraw();
      throw e;
    }

    function finalize(promise) {
      const then = promise.then;
      const countdown = function() {
        count--;
        if (count === 0) {
          redraw();
        }
      };
      promise.then = function() {
        count++;
        const next = then.apply(promise, arguments);
        next.then(countdown, countdown);
        return finalize(next);
      };

      return promise;
    }
  };
};

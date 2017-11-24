module.exports = throttle;

const requestAnimationFrame = window.requestAnimationFrame ||
  (f => setTimeout(f, 16));
const cancelAnimationFrame = window.cancelAnimationFrame || window.clearTimeout;

function throttle(fn, interval) {
  let timer = null;
  let schedule = interval
    ? f => setTimeout(f, interval)
    : requestAnimationFrame;
  let cancel = interval ? window.clearTimeout : cancelAnimationFrame;

  return (...args) => {
    cancel(timer);
    timer = schedule(() => fn(...args));
  };
}

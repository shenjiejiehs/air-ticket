/**
 * toast
 */
require('./index.css');


var toastsTimer = null;
var el = null;
function showToasts(msg) {
  if (!el) {
    el = document.createElement('div');
    el.className = 'toasts';
    document.body.appendChild(el);
  }
  el.innerHTML = msg;
  el.style.display = 'block';
  el.style['margin-left'] = (-(el.clientWidth / 2)) + 'px';
  el.classList.add('show');

  if (toastsTimer) {
    clearTimeout(toastsTimer);
  }
  toastsTimer = setTimeout(function() {
    el.classList.remove('show');
    toastsTimer = setTimeout(function() {
      toastsTimer = null;
      el.style.display = 'none';
    }, 1000);
  }, 3000);
}

module.exports = {
  show: showToasts
};

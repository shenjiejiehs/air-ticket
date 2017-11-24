define('utils/effect/blurInput', function() {
  return function(selector) {
    var inputs = document.querySelectorAll(selector || '*');
    if (inputs && inputs.length > 0) {
      Array.prototype.slice.call(inputs, 0, inputs.length).forEach(function(item) {
        item.blur();
      });
    }
  };
});
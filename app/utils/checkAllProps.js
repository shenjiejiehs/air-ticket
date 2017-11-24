var valByKeypath = require('../common/l/valByKeypath');
function checkAllProps(props, o) {
  var len = props.length;

  for (var i = 0; i < len; i++) {
    if (!valByKeypath(props[i], o)) {
      return false;
    }
  }
  return true;
}

module.exports = checkAllProps;

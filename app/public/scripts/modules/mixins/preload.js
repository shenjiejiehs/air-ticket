var once = require('common/fn/once');
var signal = require('shared/signal');
//mixin - preload modules
module.exports = {
  //preload: ['mod_name1', ...],
  getInitialProps: function(props) {
    var ctorProto = this._ctor;
    if (!ctorProto.preloadFn) {
      ctorProto.preloadFn = once(_preload.bind(null, ctorProto.preload));
    }
    ctorProto.preloadFn();
    return props;
  }
};

function _preload(preloads) {
  var preloadMods = [].concat(preloads).filter(function(item) {
    return typeof item === 'string' && item.trim() !== '';
  });

  if (preloadMods.length) {
    signal.send('preload', preloadMods);
  }
}

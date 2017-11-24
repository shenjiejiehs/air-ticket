var type = require('common/type');
var slice = require('common/slice');
// @ifdef DEBUG
var assert = require('common/assert');
// @endif

module.exports = prepareCombinedSignals;

function prepareCombinedSignals(ctrl, signalScheme){
  // @ifdef DEBUG
  assert(type.isObject(signalScheme), '[createController.prepareCombinedSignals]nvalid signal scheme! given:' + signalScheme, TypeError);
  // @endif

  var combinedSignals = Object.create(null);


  Object.keys(signalScheme).forEach(function(name){
    if(combinedSignals[name]){
      return;
    }
    combinedSignals[name] = _resolveSignal(name, ctrl, combinedSignals, signalScheme);
  });
  ctrl.combinedSignals = combinedSignals;
}

function _resolveSignal(name, ctrl, combinedSignals, signalScheme){
  if(!(name in signalScheme)){
    return ctrl._signal.getSig(ctrl._sigName(name));
  }

  var sig = combinedSignals[name];
  if(sig){
    return sig;
  }

  sig = combinedSignals[name] = _combineSignal(name, ctrl, combinedSignals, signalScheme);
  return sig;
}

function _combineSignal(name, ctrl, combinedSignals, signalScheme){
  var scheme = signalScheme[name];
  // @ifdef DEBUG
  assert(type.isArray(scheme) && type.isFunction(scheme[scheme.length - 1]), '[createController.prepareCombinedSignals]invalid scheme for "'+name+'"!');
  // @endif
  var combineFn = scheme[scheme.length - 1];
  var deps = slice(scheme, 0 , scheme.length - 1).map(function(dname){
    return _resolveSignal(dname, ctrl, combinedSignals, signalScheme);
  });

  return combineFn.apply(null, [ctrl].concat(deps));
}


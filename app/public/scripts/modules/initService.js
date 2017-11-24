var createController = require('./createController');
var signal = require('shared/signal');
var store = require('shared/store');
var type = require('common/type');
var onceMaker = require('../utils/emitter/once');

// @ifdef DEBUG
var assert = require('common/assert');
// @endif

/**
 * @param options: {
 *    data: [Object], // init data
 *    facets: [Object], // store facets
 *    action: [(ctrl)->void], //action register
 *    namespace: [String], //namspace for this module
 *    mixins: [Object], //common mixins for page components of this module
 *    signals: [Object], //signal scheme for generate combined signal streams
 * }
 *
 * @return [Controller] controller instance which exports some util methods
 *  ctrl.createPage : (pageSettings)->Component // component has access for ctrl's signal and store
 *  ctrl.startProcess : (options)->Promise // kickoff the browser process for this module and maybe resolve some value when is finished.
 *
 */
module.exports = function(options) {
  options = options || {};
  var initData = options.data;
  var facets = options.facets || {};
  var namespace = options.namespace;
  var action = options.action;
  var signalScheme = options.signals;
  var ctrl;

  // @ifdef DEBUG
  assert(type(initData) === 'object', '[initController]invalid initData!' + initData);
  assert(type(facets) === 'object', '[initController]invalid facets!' + facets);
  assert(typeof(action) === 'function', '[initController]invalid action!' + action);
  assert(typeof(namespace) === 'string', '[initController]invalid namespace!' + namespace);
  // @endif

  var prevData = store.get(namespace);

  if (prevData) {
    initData = prevData;
  }

  if (typeof window.__initData__ === 'object') {
    initData = mergeStoreData(initData, window.__initData__[namespace]);
    //only reset initData once
    delete window.__initData__[namespace];
    if (Object.keys(window.__initData__).length === 0) {
      delete window.__initData__;
    }
  }

  store.set(namespace, initData);


  ctrl = createController({
    signal: signal,
    signalScheme: signalScheme,
    namespace: namespace,
    store: store
  });

  store.addFacets(prefixFacets(ctrl, facets));
  action(ctrl);

  //module process status mapping
  ctrl.$process = Object.create(null);

  /*
   *  Module can provide services for other modules by exposing named signals,
   *  which will trigger the corresponding processes.
   *  Only one process can be active at any time.
      options: {
        signal: [String], // process signal name
        data: [Object] // init data for page
      }
  */
  ctrl.startProcess = function(options) {
    var signal = options.signal;
    var data = options.data;
    var process = ctrl.$process[signal];

    if (!process) {
      process = onceMaker();
      ctrl.$process[signal] = process;
      ctrl.signal(signal)(data);
    }

    return process;

  };

  ctrl.endProcess = function(signal, result) {
    return _endProcess('resolve', signal, result);
  };

  ctrl.cancelProcess = function(signal) {
    return _endProcess('cancel', signal);
  };


  function _endProcess(method, signal, result) {
    var process = ctrl.$process[signal];
    if (process) {
      process[method](result);
      delete ctrl.$process[signal];
    }
  }


  return ctrl;
};

//helpres
var each = require('common/l/each');
var extend = require('common/extend');

function mergeStoreData(data, input) {
  if (Object(input) !== input) {
    return data;
  }
  each(function(v, k) {
    if (!data[k]) {
      data[k] = v;
    } else {
      data[k] = type.isObject(v) ? extend({}, data[k], v) : v;
    }
  }, input);
  return data;
}

function prefixFacets(ctrl, facets) {
  return Object.keys(facets).reduce(function(m, k) {
    var v = facets[k];
    v = v.map(function(kp) {
      if (type.isString(kp)) {
        return ctrl._resolveName(kp);
      }
      return kp;
    });
    m[ctrl._resolveName(k)] = v;
    return m;
  }, {});
}

var makeStack = require('common/fn/stack');
var evtify = require('common/evtify');
var slice = require('common/slice');
var R = require('common/frp/rstream');
var type = require('common/type');
var Dict = require('common/adt/dict');

// @ifdef DEBUG
var assert = require('common/assert');
// @endif

var prepareCombinedSignals = require('./prepareSignal');


var defaultMixin = {
  signal: function(name /*,handlers...*/ ) {
    var signal = this._signal;
    var signame = this._sigName(name);
    var handlers = slice(arguments, 1),
      signalHanlder;

    if (handlers.length > 0) {
      signalHanlder = makeStack(this).apply(null, handlers);
      signal.on(signame, signalHanlder);
      return this;
    } else {
      return signal.bindSendWith(signame);
    }

  },
  _sigName: function(name) {
    // @ifdef DEBUG
    assert(type.isString(name), '[createController.signal]invalid signal name! given:' + name, TypeError);
    // @endif
    if (this.combinedSignals && R.isStream(this.combinedSignals[name])) {
      return this.combinedSignals[name];
    }
    // global signal names start with '::'
    return this._resolveName(name);
  },
  _resolveName: function(name) {
    // @ifdef DEBUG
    assert(type.isString(name), '[createController._resolveName]invalid name! given:' + name, TypeError);
    // @endif

    // global signal names start with '::'
    return name.indexOf('::') === 0 ? name.slice(2) :
      this._namespace ? this._namespace + (name ? ('.' + name) : '') :
      name;
  },
  replaySignal: function() {
    this._signal.replay();
  },
  get: function(keypath) {
    return this._store.get(this._resolveName(keypath));
  },
  set: function(keypath, data, isSilent) {
    if (type.isObject(keypath)) {
      var updates = resolveKeys(this._resolveName.bind(this), keypath);
      this._store.set(updates, data);
    } else {
      this._store.set(this._resolveName(keypath), data, isSilent);
    }
    return this;
  },
  select: function(keypath) {
    return this._store.cursor(this._resolveName(keypath));
  },
  facet: function(keys) {
    var self = this;
    if (type.isArray(keys)) {
      keys = keys.map(function(k) {
        return self._resolveName(k);
      });
    } else {
      keys = this._resolveName(keys);
    }
    return this._store.facet(keys);
  },
  addFacets: function(facets) {
    this._store.addFacets(facets);
  },
  observe: function(kpath, handler) {
    kpath = [].concat(kpath).map(this._resolveName.bind(this));
    this._store.observe(kpath, this._emitUpdate(handler));
    return this;
  },
  observeFacets: function(facetKey, handler) {
    facetKey = [].concat(facetKey).map(this._resolveName.bind(this));
    this._store.observeFacets(facetKey, this._emitUpdate(handler));
    return this;
  },
  removeHandler: function(handler){
    var wrapHandler = this._wrapHandlers.get(handler);
    if(wrapHandler){
      this._store.removeHandler(wrapHandler);
      this._wrapHandlers.remove(handler);
    }
  }
};


function createController(opts) {
  opts = opts || {};
  // @ifdef DEBUG
  assert(typeof opts.namespace === 'string' && opts.namespace.trim() !== '', '[createController]invalid namespace! given: ' + opts.namespace);
  // @endif
  var controller = Object.create(defaultMixin);
  evtify(controller);
  controller._store = opts.store;
  controller._signal = opts.signal;
  controller._namespace = opts.namespace;

  controller._store.onUpdate(controller.emit.bind(controller, 'syncUpdate'));
  controller._wrapHandlers = new Dict();
  controller._emitUpdate = function(handler) {
    var wrapHandler = controller._wrapHandlers.get(handler);
    if (!wrapHandler) {
      wrapHandler = function() {
        if (type.isFunction(handler)) {
          handler();
        }
        controller.emit('update');
      };
      controller._wrapHandlers.set(handler, wrapHandler);
    }
//ifdef DEBUG
    wrapHandler._tag = handler._tag;
//endif
    return wrapHandler;
  };
  if (opts.signalScheme) {
    prepareCombinedSignals(controller, opts.signalScheme);
  }

  return controller;
}

module.exports = createController;

//helpers

function resolveKeys(resolver, o) {
  return Object.keys(o).reduce(function(m, k) {
    var v = o[k];
    m[resolver(k)] = v;
    return m;
  }, {});
}

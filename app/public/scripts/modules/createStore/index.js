var extend = require('common/extend');
var type = require('common/type');
var pick = require('common/l/pick');
var clone = require('common/l/clone');
var valByKeypath = require('common/l/valByKeypath');
var assert = require('common/assert');
var makeCursor = require('./makeCursor');
var memoizeFacetsFn = require('./memoizeFacetsFn');
var treeUtil = require('./tree');

var defaultMethods = {
  get: function(keypath) {
    keypath = type(keypath) === 'string' ? keypath : '';
    return valByKeypath(keypath, this._data);
  },
  set: function(keypath, data, isSilent) {
    var self = this;
    isSilent = type.isObject(isSilent) ? isSilent : {
      isSilent: !!isSilent
    };
    //can use reference comparison
    if (type(keypath) === 'object') {
      isSilent = data;
      Object.keys(keypath).forEach(function(kp) {
        self.set(kp, keypath[kp], isSilent);
      });
      return;
    }

    this._setDataOnKpath(keypath, data);
    this._triggerUpdate(keypath, isSilent);

    return this;
  },

  cursor: function(keypath) {
    return makeCursor(this, keypath);
  },
  addFacets: function(facets) {
    if (type(facets) === 'object') {
      this._facets = extend(this._facets, memoizeFacetsFn(facets));
    }
    //complete observers
    var keys, self = this,
      facetMap = this._facetHandlerMap;
    if (type.isObject(facetMap) && (keys = Object.keys(facetMap)).length > 0) {
      keys = keys.filter(function(k) { return !!facets[k]; });
      keys.map(function(k) {
        return [k, facetMap[k]];
      }).forEach(function(pair) {
        pair[1].forEach(function(handler) {
          self._addFacetObserver(pair[0], handler);
        });
      });
      keys.forEach(function(k) {
        delete self._facetHandlerMap[k];
      });
      if (Object.keys(this._facetHandlerMap).length === 0) {
        delete this._facetHandlerMap;
      }
    }
    return this;
  },
  facet: function(keys) {
    var computed = pick(this._facets, this._data);
    return type.isArray(keys) ? keys.map(function(k) { return computed[k]; }) : computed[keys];
  },

  serialize: function() {
    try {
      return JSON.stringify(this._data);
    } catch (e) {
      return null;
    }
  },

  onUpdate: function(fn) {
    if (!type.isFunction(this._onUpdateFn)) {
      this._onUpdateFn = fn;
    }
    return this;
  },
  observe: function(keypath, handler) {
    assert(type.isFunction(handler));
    this._observers = this._observers || {};
    var observers = this._observers;
    keypath = [].concat(keypath).filter(type.isString);
    keypath.forEach(function(kp) {
      treeUtil.addHandlerToTree(kp, handler, observers);
    });
    return this;
  },
  removeHandler: function(handler) {
    treeUtil.rmHandlerFromTree(handler, this._observers);
  },
  observeFacets: function(facetKey, handler) {
    assert(type.isFunction(handler));
    facetKey = [].concat(facetKey).filter(type.isString);
    facetKey.forEach(this._observeFacet.bind(this, handler));
    return this;
  },
  options: function() {
    if (arguments.length === 0) {
      return this._options;
    }

    return this._options[arguments[0]];
  },
  _observeFacet: function(handler, facet) {
    if (this._addFacetObserver(facet, handler)) {
      return;
    }
    this._facetHandlerMap = this._facetHandlerMap || {};
    var handlers = this._facetHandlerMap[facet] || [];
    if (handlers.indexOf(handler) === -1) {
      handlers.push(handler);
    }
    this._facetHandlerMap[facet] = handlers;
  },
  _setDataOnKpath: function(kpath, data) {
    kpath = type(kpath) === 'string' ? kpath : '';
    if (kpath.trim().length === 0) {
      this._data = clone(data);
      return;
    }

    var rootKey = kpath.split('.')[0];
    valByKeypath(kpath, this._data, data);
    this._data[rootKey] = clone(this.get(rootKey));
  },

  _triggerUpdate: function(keypath, opts) {
    //synchronously trigger update event
    var self = this;
    if (this._onUpdateFn) {
      this._onUpdateFn(opts);
    }
    //debounce observers invocation, batch updates before invocation
    if (opts.isSilent) {
      if (opts.save === false) {
        return;
      }
      this._saveToStorage();
    }
    this._batchUpdates(keypath);
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(function() {
      self._invokeObservers();
      self._clearUpdates();
      self._timer = null;
      if (opts.save === false) {
        return;
      }
      self._saveToStorage();

    }, 10);

  },
  _batchUpdates: function(kpath) {
    this._updates = this._updates || {};
    treeUtil.addUpdateToTree(kpath, this._updates);
  },
  _clearUpdates: function() {
    this._updates = null;
  },
  _invokeObservers: function() {
    var handlers = treeUtil.getHandlers(this._updates, this._observers);

    handlers.forEach(function(handler) {
      handler();
    });
  },
  _addFacetObserver: function(key, handler) {
    var facets = this._facets;
    var facet = facets[key];
    var self = this;
    if (facet) {
      facet.slice(0, facet.length - 1).forEach(function(kp) {
        treeUtil.addHandlerToTree(kp, handler, self._observers);
      });
      return true;
    }
    return false;
  },
  _saveToStorage: function() {
    if (typeof sessionStorage !== 'undefined' && type.isFunction(sessionStorage.setItem)) {
      sessionStorage.setItem(this._options.storageKey || 'APP_STATE_SNAPSHOT', this.serialize());
    }
  },
  print: function() {
    treeUtil.print('fns', this._observers);
  }
};

function createStore(init, facets, options) {
  var store = Object.create(defaultMethods);
  //init instance
  store._data = clone(init);
  store._options = options || {};
  store._observers = {};

  if (type(facets) !== 'object') facets = {};
  store._facets = {};
  store.addFacets(facets);

  return store;
}

module.exports = createStore;

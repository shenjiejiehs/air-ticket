var type = require('common/type');
var extend = require('common/extend');
var mapObject = require('common/l/mapObject');
// var pureRender = require('./pureRender/index');
var each = require('common/l/each');

// @ifdef DEBUG
var assert = require('common/assert');
// @endif
module.exports = function injectCtrl(ctrls) {
  //ctrls => {
  // 'ctrlName1': ctrl1,
  // 'ctrlName2': ctrl2,
  // ...
  //}
  return {
    //selectors: {},
    //facets: {},
    // mixins: [pureRender()],
    getInitialProps: function(props) {
      this._prepareViewModel();
      return props;
    },
    signal: function(name) {
      var parts = _preparePaths(name),
        ctrlName = parts[0],
        signalName = parts[1],
        ctrl = ctrls[ctrlName];

      // @ifdef DEBUG
      assert(ctrl, '[injectCtrl]Invalid keypath: unknown controller name! given:' + ctrlName);
      // @endif

      return ctrl.signal(signalName);
    },
    getInitialState: function() {
      var getVM = this.__viewModel;
      if (getVM) {
        return getVM();
      }
      return {};
    },
    _prepareViewModel: function() {
      var selectors, facets, getters;
//@ifdef DEBUG      
      var _tag = this.name || this.id;
//@endif
      this.updateHandler = (function() {
        var state = this.__viewModel();
        this.setState(state);
      }).bind(this);
//@ifdef DEBUG
      this.updateHandler._tag = _tag;
//@endif
      if (type(this.selectors) === 'object') {
        selectors = prepareSelectors(ctrls, this.selectors, this.updateHandler);
      }

      if (type(this.facets) === 'object') {
        facets = prepareFacets(ctrls, this.facets, this.updateHandler);
      }
      getters = extend({}, selectors, facets);
      this.__viewModel = function() {
        return mapObject(function(valFn) {
          return valFn();
        }, getters);
      };
    },

    componentWillUnmount: function() {
      var self = this;
      each(function(ctrl) {
        ctrl.removeHandler(self.updateHandler);
      }, ctrls);
    },
    componentWillReceiveProps: function(props) {
      var getVM = this.__viewModel;
      if (getVM) {
        this.setState(getVM(), true);
      }
      return props;
    }
  };
};

//helpers
function prepareSelectors(ctrls, selectors, updateHandler) {
  return _prepareGetters(ctrls, selectors, 'selectors', updateHandler);
}

function prepareFacets(ctrls, facets, updateHandler) {
  return _prepareGetters(ctrls, facets, 'facets', updateHandler);
}


function _prepareGetters(ctrls, getters, gtype, updateHandler) {
  return mapObject(function(kpath) {
    var defaultVal, ctrlName, paths, ctrl;
    if (type(kpath) === 'array' && kpath.length > 1) {
      defaultVal = kpath[1];
      kpath = kpath[0];
    }
    paths = _preparePaths(kpath);
    ctrlName = paths[0];
    kpath = paths[1];
    ctrl = ctrls[ctrlName];
    // @ifdef DEBUG
    assert(ctrl, '[injectCtrl]Invalid keypath: unknown controller name! given:' + ctrlName);
    // @endif

    //observe updates
    ctrl[gtype === 'selectors' ? 'observe' : 'observeFacets'](kpath, updateHandler);
    return function() {
      var val = gtype === 'selectors' ? ctrl.get(kpath) : ctrl.facet(kpath);
      return val != null ? val : defaultVal;
    };
  }, getters);
}

function _preparePaths(kpath) {
  var paths = kpath.split('.');
  return [paths[0], paths.slice(1).join('.')];
}

var router = require('utils/router');
var m = require('m-react');
var extend = require('common/extend');
var signal = require('shared/signal');

/**
 *  options = >{
 *    home: 'home_page_module_name',
 *    default: 'default_page_module_name',// same as home module if unset
 *    el: 'mounting dom element css selector'
 *  }
 *
 **/
module.exports = function initRoute(options) {
  var defaultMod = options["default"];
  var homeMod = options.home;
  var rootEl = document.querySelector(options.el);

  router.add('/:module*', sendSignal, makeHandler(rootEl, function(ctx) {
    return ctx.params.module || defaultMod || homeMod;
  }));

  router.add('*', makeHandler(rootEl, function() {
    return defaultMod || homeMod;
  }));

  router.onHistoryBack(function(ctx) {
    signal.send('historyBack', ctx);
  });

  // deprecated
  return {
    start: function(fn) {
      var options = {};

      if (defaultMod) {
        options.defaultPath = defaultMod;
      }

      if (typeof fn === 'function') {
        options = fn(rootEl, router, options);
      }
      router.start(options);
    }
  };
};

function sendSignal(ctx, next) {
  signal.send('routeChange', ctx);
  next();
}

function makeHandler(rootEl, modFn) {
  return function _routeHandler(ctx) {
    var mod = modFn(ctx);
    var props = extend({}, ctx.state, ctx.query);
    requireAsync(mod).then(function(Page) {
      m.mount(rootEl, m(Page, props), true, true);
      window.scroll(0, 0);
    })['catch'](function(e) {
      console.log(e);
    });
    ctx.config = function(input) {
      extend(props, input);
    };
  };
}

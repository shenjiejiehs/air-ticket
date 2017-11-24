var Context = require('./router/context');
var Route = require('./router/route');
var G = require('./router/globals');
var assert = require('common/assert');
var slice = require('common/slice');
var $location = G.location;
var qs = require('./queryString');
var historySession = require('./router/session');

function route(path, state) {
  assert(typeof path === 'string', '[Router.route]invalid path!' + path);
  return route.show(path, state);
}
var onpopstate = (function() {
  var loaded = false;

  if ('undefined' === typeof window) {
    return;
  }

  if (document.readyState === 'complete') {
    loaded = true;
  } else {
    window.addEventListener('load', function() {
      setTimeout(function() {
        loaded = true;
      }, 0);
    });
  }

  return function _onpopstate(e) {
    if (!loaded) return;

    historySession.pop();

    var sessionCtx, currentState, prevContext, backState;

    sessionCtx = historySession.topSession();

    prevContext = G.prevContext;

    currentState = sessionCtx ? sessionCtx.state : (e.state||{});

    backState = G.backHandlingStates[currentState.path];
    // console.log('currentState: ', currentState);
    //handle history back

    if (backState != null) {
      if (backState === 'history_doubled'){
        G.backHandlingStates[currentState.path] = 'unhandled';
      }else if (['unhandled', 'start'].indexOf(backState) !== -1) {
        G.onBackCallbacks.forEach(function(cb) {
          cb(prevContext);
        });

        history.pushState(prevContext.state, prevContext.title, prevContext.canonicalPath());
        if(sessionCtx){
          historySession.push(sessionCtx);
        }
        return;
      } else if(backState === 'handled'){
        delete G.backHandlingStates[currentState.path];
        history.back();
        return;
      }
    }
    //handle session

    if (sessionCtx) {
      route.show(sessionCtx.state.path, sessionCtx.state, true, false);
      return;
    }

    if (e.state) {
      var path = e.state.path;
      route.replace(path, e.state);
    } else {
      route.show($location.pathname + $location.search + $location.hash, null, false);
    }
  };
})();

route.show = function(path, state, changeState, handleSession, needDispatch) {
  var ctx = new Context(path, state);
  G.currentContext = ctx;
  if(false !== needDispatch){
    dispatch(ctx);
  }
  if (true !== ctx.unhandled && false !== changeState) {
    ctx.push(handleSession);
  }
  return ctx;
};

function isFun(o) {
  return typeof o === 'function';
}

function addHandlers(registry) {
  return function _addHandlers(path) {
    assert(typeof path === 'string', '[Router.add_' + registry + ']invalid path!' + path);
    var handlers = slice(arguments, 1).filter(isFun),
      r = new Route(path);
    handlers.forEach(function(handler) {
      G[registry].push(r.middleware(handler));
    });
    return route;
  };
}

route.add = addHandlers('callbacks');

route.addExit = addHandlers('exits');

route.start = function(options) {
  options = options || {};
  if (G.running) return;
  G.running = true;
  if (false === options.decodeURLComponents) G.decodeURLComponents = false;
  if (options.pathKey != null) G.pathKey = options.pathKey;
  window.addEventListener('popstate', onpopstate, false);
  _startRoute(options);
};

route.stop = function() {
  if (!G.running) return;
  G.currentContext = null;
  G.prevContext = null;
  G.len = 0;
  G.running = false;
  window.removeEventListener('popstate', onpopstate, false);
};

route.redirect = function(from, to) {
  assert(typeof from === 'string', '[Router.redirect]invalid first parameter!' + from);
  if (typeof to === 'string') {
    return route.add(from, function() {
      setTimeout(function() {
        route.replace(to);
      }, 0);
    });
  }

  setTimeout(function() {
    route.replace(from);
  }, 0);
};

route.back = function() {
  history.back();
  if (G.len > 0) {
    G.len -= 1;
  }
};

route.replace = function(path, state, init, needDispatch) {
  var ctx = new Context(path, state);
  G.currentContext = ctx;
  ctx.init = init;
  if(false !== needDispatch){
    dispatch(ctx);
  }
  if (true !== ctx.unhandled) {
    ctx.replace();
  }
  return ctx;
};

route.startSession = function(sname) {
  return G.currentContext.startSession(sname);
};

route.endSession = function(sname) {
  return G.currentContext.endSession(sname);
};

route.stopBack = function() {
  return G.currentContext.stopBack();
};

route.resumeBack = function() {
  return G.prevContext.resumeBack();
};

route.onHistoryBack = function(fn) {
  if (typeof fn === 'function' && G.onBackCallbacks.indexOf(fn) === -1) {
    G.onBackCallbacks.push(fn);
  }
};

route.currentPathname = function(){
  return G.currentContext && G.currentContext.pathname;
};

function dispatch(ctx) {
  var prev = G.prevContext,
    i = 0,
    j = 0;

  //reset history back states
  if(prev && G.backHandlingStates[prev.state.path] && G.backHandlingStates[prev.state.path] !== 'handled'){
    G.backHandlingStates[prev.state.path] = 'history_doubled';
  }

  G.prevContext = ctx;

  function nextExit() {
    var fn = G.exits[j++];
    if (!fn) {
      return nextEnter();
    }
    fn(prev, nextExit);
  }

  function nextEnter() {
    var fn = G.callbacks[i++];
    if (ctx !== G.currentContext) {
      ctx.unhandled = true;
      return;
    }
    if (!fn) {
      return unhandled(ctx);
    }

    fn(ctx, nextEnter);
  }

  if (prev) {
    nextExit();
  } else {
    nextEnter();
  }
}

function unhandled(ctx) {
  console.log('unhandled route: ' + ctx.canonicalPath());
}


function makeRouterPath($location, options) {
  var defaultPath = options && options.defaultPath;
  var redirectPath = options && options.redirectPath;
  var search = '?' === $location.search[0] ? $location.search.slice(1) : '';
  var hash = $location.hash;
  var queryObj = qs.parse(search);
  var routerPath = queryObj[G.pathKey] || '/';
  delete queryObj[G.pathKey];

  routerPath = redirectPath || (routerPath !== '/' ? routerPath : defaultPath ? defaultPath : '/');

  return routerPath + (Object.keys(queryObj).length ? '?' + qs.build(queryObj) : '') + hash;

}

function _startRoute(options){
  var routePathFromUrl = makeRouterPath($location, options);
  var initCtx;
  if(options.landingPage){
    route.replace(options.landingPage, null, true, false);
    setTimeout(function(){
      initCtx = route.show(routePathFromUrl);
      if(options.startSession){
        initCtx.startSession(options.startSession);
      }
    }, 0);
  }else{
    initCtx = route.replace(routePathFromUrl, null, true);
    if(options.startSession){
      initCtx.startSession(options.startSession);
    }
  }
}

module.exports = route;

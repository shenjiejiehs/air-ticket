var initRoute = require('modules/initRoute');
var appCfg = require('./config');

var homePage = appCfg.homePage;
var SESSION_FLAG_KEY = appCfg.sessionFlagKey;

initRoute({
  el: '#content',
  home: homePage,
  "default": homePage
}).start(function(_, router, options){
  if(appCfg.reservedQueryKeys){
    options.reservedQueryKeys = appCfg.reservedQueryKeys;
  }
  if(appCfg.routerMode === 'pathname'){
    options.mode = 'pathname';
    options.base = window.routeBase;
    delete window.routeBase;
  }

  if(appCfg.routePathKey){
    options.pathKey = appCfg.routePathKey;
  }

  //if has session data don not goto default home page, unless need a redirection
  var hasSess = getFromSess(SESSION_FLAG_KEY);
  if(false === window.__redirect__ || hasSess){
    setToSess(SESSION_FLAG_KEY, '1');

    delete window.__redirect__;

    if(window.__landingPage__){
      options.landingPage = window.__landingPage__;
      delete window.__landingPage__;
    }

    return options;
  }
  setToSess(SESSION_FLAG_KEY, '1');
  options.redirectPath = homePage;
  return options;
});

function getFromSess(key){
  if(!window.sessionStorage){
    return undefined;
  }
  return window.sessionStorage.getItem(key);
}

function setToSess(key, val){
  if(!window.sessionStorage){
    return;
  }

  window.sessionStorage.setItem(key, val);
}

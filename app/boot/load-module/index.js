var moduleServ = require('express-module-serv');
var pUtil = require('path');
var valByKeyPath = require('../../common/l/valByKeypath');
var cmdWrapper = require('express-module-serv/transformers/cmd-wrapper');
// var cssWrapper = require('express-module-serv/transformers/css-wrapper');
var addComma = require('express-module-serv/transformers/add-comma');
var svgWrapper = require('./transformers/svg');
var merge = require('merge');

module.exports = function(app, params) {
  var appCfg = app.get('appConfig');
  resolveRelativePath('pathSettings.base', true);
  resolveRelativePath('transformerSettings.cssWrapper.staticPath');

  params = initGlobals(params, appCfg);


  var transformers = [
    params.debug ? require('./transformers/regenerator')() : null,
    params.debug ? require('./transformers/next-js')() : null,
    require('./transformers/css-module')(merge({ debug: params.debug }, valByKeyPath('transformerSettings.cssWrapper', params))),
    // cssWrapper(valByKeyPath('transformerSettings.cssWrapper', params)),
    svgWrapper(valByKeyPath('transformerSettings.svgWrapper', params)),
    cmdWrapper(),
    addComma()
  ].filter(Boolean);

  params.transformers = transformers;

  if (process.env.NODE_ENV === 'production') {
    console.log('[express-module-serv]: reload on change is turned off!');
    params.reloadOnChange = false;
  }
  moduleServ(app, params);

  //helper
  function resolveRelativePath(keyPath, force) {
    var relativePath = valByKeyPath(keyPath, params);

    if (force || relativePath) {
      valByKeyPath(keyPath, params, pUtil.resolve(app.get('$boot_dir'), relativePath));
    }
  }
};

function initGlobals(params, appCfg) {
  var appVersion = appCfg.version;
  var keyForRouter = valByKeyPath('client.qsKeyForRouter', appCfg);
  params.globals = {};
  // in browser, you can get window.process.env.NODE_ENV
  var env = appCfg.env;
  params.globals = {
    process: {
      browser: true,
      env: {
        NODE_ENV: env.NODE_ENV
      }
    }
  };
  if (appVersion) {
    params.globals.appVersion = appVersion;

  }
  if (keyForRouter) {
    params.globals.__qsKeyForRouter__ = keyForRouter;
  }
  return params;
}

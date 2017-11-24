var routesLoader = require('express-routes-loader');
var pUtil = require('path');
module.exports = function routesLoaderTask(app, routeDir) {
  routesLoader(app, pUtil.resolve(app.get('$boot_dir'), routeDir));
};

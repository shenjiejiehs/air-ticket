// view engine setup
var hbs = require('express-hbs');
var path = require('path');
module.exports = function view(app, params) {
  var boot_dir = app.get('$boot_dir');
  // view engine setup
  app.set('views', path.join(boot_dir, params.path.view));
  app.set('view engine', 'html');
  app.engine('html', hbs.express3());
  // custome hbs helper
  hbs.registerHelper('expOR', function(value, defaultVal) {
    return new hbs.SafeString(value || defaultVal);
  });
  hbs.registerHelper('raw', function(options) {
    return options.fn();
  });
};

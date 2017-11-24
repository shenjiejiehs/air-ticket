var prism = require('connect-prism2');
var rqdir = require('rqdir');
var pUtil = require('path');

var configs = rqdir(pUtil.resolve(__dirname, 'config'), {
  excludes: /^\_|(utils?)/i
});

var logfilePath = pUtil.resolve(__dirname, 'logs/prism.log');

module.exports = function prismMiddleware() {

  prism.logToFile({
    filename: logfilePath,
    maxsize: 4096 * 10,
    maxFiles: 10,
    level: 'verbose',
    json: false
  });

  prism.useApi();

  Object.keys(configs).forEach(function(ckey){
    prism.create(configs[ckey]);
  });

  return prism.middleware;
};

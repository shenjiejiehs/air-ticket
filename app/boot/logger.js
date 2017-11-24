var loggerMiddlewareCfg = require('../middleware/logger').config;
// var valByKeypath = require('../common/l/valByKeypath');

module.exports = loggerMiddlewareCfg({
  valueMappingFn: function(req){
      return {
        'body': require('../utils/shortenStr')(req.body)
      };
  }
});

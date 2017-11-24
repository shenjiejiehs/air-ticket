var PrismUtil = require('connect-prism2/lib/services/prism-utils');
var prismUtil = new PrismUtil();

module.exports = function mockFilenameGenerator(config, req) {
  var reqData = prismUtil.filterUrl(config, req.url);
  var maxLength = 255;
  var prefix = reqData.replace(/\/|\_|\?|\<|\>|\\|\:|\*|\||\"/g, '_');
  var shasum = require('crypto').createHash('sha1');
  shasum.update(reqData);
  var hash = '_' + shasum.digest('hex') + '.json';
  return prefix.substring(0, maxLength - hash.length - 4) + hash;
};

/**
 * 接受跨域请求
 */

var url = require('url');

var ACCEPT_DOMAIN = {
  'rsscc.com': 1,
  'rsscc.cn': 1,
  '133.cn': 1,
  'huoli.com': 1,
  'maopao.com': 1
};

module.exports = function(req, res, next) {

  var referer = req.get('referer');
  if (referer) {
    var refererHost = url.parse(referer).hostname || '';
    var refererDomain = refererHost.split('.').slice(-2).join('.');

    if (refererDomain in ACCEPT_DOMAIN) {
      res.set('Access-Control-Allow-Origin', '*');
    }
  }

  next();
};

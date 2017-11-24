var mockFilenameGenerator = require('./utils/mockFilenameGenerator');
module.exports = {
  "name": "gaotie_prod",
  "mode": "mockrecord",
  "context": ["/gaotie_prod"],
  "host": "jt2.rsscc.com",
  "port": 443,
  "https": true,
  "changeOrigin": true,
  "delay": 0,
  "rewrite": {
    "^/gaotie_prod": ''
  },
  "mockFilenameGenerator": mockFilenameGenerator,
  "ignoreParameters": ['time', 'websid', 'wp', 'wuid', 'ptid']
};

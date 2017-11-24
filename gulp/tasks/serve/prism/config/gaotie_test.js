var mockFilenameGenerator = require('./utils/mockFilenameGenerator');

module.exports = {
  "name": "gaotie_test",
  "mode": "mockrecord",
  "context": ["/gaotie_test"],
  "host": "221.235.53.167",
  "port": 8070,
  "https": false,
  "changeOrigin": true,
  "delay": 0,
  "rewrite": {
    "^/gaotie_test": ''
  },
  "mockFilenameGenerator": mockFilenameGenerator,
  "ignoreParameters": ['time', 'websid', 'wp', 'wuid', 'ptid']
};


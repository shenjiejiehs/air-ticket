var mockFilenameGenerator = require('./utils/mockFilenameGenerator');

module.exports = {
  "name": "hangban_test",
  "mode": "mockrecord",
  "context": ["/hangban_test"],
  "host": "221.235.53.167",
  "port": 6080,
  "https": false,
  "changeOrigin": true,
  "delay": 0,
  "rewrite": {
    "^/hangban_test": ''
  },
  "mockFilenameGenerator": mockFilenameGenerator,
  "ignoreParameters": ['uid', 'client', 'source', 'uuid', 'platform', 'imei', 'cver', 'dver', 'iver', 'system', 'p']
};

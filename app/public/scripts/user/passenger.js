const registerRouteHandlers = require('modules/initRoute');
const router = require('utils/router');
const service = require('./services');

router.start();

registerRouteHandlers({
  el: '#content'
});

service.signal('passenger.start')();

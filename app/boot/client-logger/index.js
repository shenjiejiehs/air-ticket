var bunyan = require('bunyan');
var bunyanTcp = require('bunyan-tcp2');
var pUtil = require('path');
var valByKeypath = require('../../common/l/valByKeypath');

module.exports = function(app, params) {
  var streams = [
    {
      stream: process.stdout,
      type: 'stream',
      level: params.log_level || 'info'
    }
  ];

  if (params.debug === false) {
    streams = [
      {
        type: 'raw',
        stream: bunyanTcp.createBunyanStream({
          server: params.log_server_host || '127.0.0.1',
          port: params.log_server_port || 13337,
          backoffStrategy: {
            name: 'fibonacci'
          }
        }),
        level: params.log_level || 'info',
        closeOnExit: true
      }
    ];
  }

  var logger = bunyan.createLogger({
    name: process.env.APP_NAME || 'jipiao',
    streams: streams
  });

  app.use('/log', function(req, res) {
    var data = req.body;
    var ua = req.header('user-agent');
    var sess = valByKeypath('session', req), sessId;

    if (data && data.length) {
      data.forEach(function(logData) {
        if (
          ['debug', 'info', 'warn', 'error', 'fatal'].indexOf(logData.l) !== -1
        ) {
          valByKeypath('d.userAgent', logData, ua);
          if (sess) {
            sessId = sess.id;
            sess = Object.keys(sess).reduce(function(m, k) {
              if (k !== 'cookie') {
                m[k] = sess[k];
              }
              return m;
            }, {});
            sess.sessionId = sessId;
            valByKeypath('d.session', logData, sess);
          }
          var nameVal = valByKeypath('d.name', logData);
          if (nameVal) {
            delete logData.d.name;
            valByKeypath('d._d$name', nameVal);
          }
          logger[logData.l](logData.d, '[client log]' + (logData.m || ''));
        }
      });
    }
    res.status(200).end();
  });
};

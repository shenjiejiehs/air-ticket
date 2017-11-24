/**
 * 在req.session.deviceInfo中写入用户设备信息，并据此写入res.locals.headless，供模板渲染使用
 */

var HEADLESS_APP = {
  hbgj: 1,
  gtgj: 1
};

module.exports = function(req, res, next) {
  if (!req.session) {
    console.log('express-session is required for device_info middleware');
    next();
    return;
  }

  var deviceInfo = req.session.deviceInfo;

  if (!deviceInfo) {

    if (isWechat(req)) {
      deviceInfo = {
        ip: req.ip,
        client: 'weixin', //deprecated
        app: 'weixin'
      };

    } else {
      var imei = req.query.imei || '';
      var deviceId = req.query.uid || '';
      var p = req.query.p;

      if (p) {
        // fix the duplicate param issue
        p = p.split ? p : p[0];

        var items = p.split(','),
          os = items[1] || '',
          os_version = os.replace('ios', '').replace('android.', ''),
          os_name = os.match(/[a-zA-Z]*/)[0],
          app = items[2];

        if (app == 'hbgjpro') {
          app = 'hbgj';
        } else if (app == 'gtgjpro') {
          app = 'gtgj';
        }

        deviceInfo = {
          ip: req.ip,
          imei: imei,
          deviceId: deviceId,
          app_source: items[0],
          os: os, //os全称，如ios8.3, android.4.4.2
          os_name: os_name, //操作系统名称，如ios, android
          os_version: os_version, //操作系统版本
          client: app, //deprecated
          app: app,
          app_version: items[3], //客户端版本
          version: items[3], //deprecated
          device: items[4],
          p: p
        };
      }
    }

    if (deviceInfo) {
      req.session.deviceInfo = deviceInfo;
      console.log('Got device info, ', deviceInfo);
    }
  }

  if (deviceInfo && deviceInfo.app in HEADLESS_APP) {
    res.locals.headless = true;
  }

  next();
};


function isWechat(req) {
  return (/MicroMessenger/ig).test(req.get('user-agent'));
}

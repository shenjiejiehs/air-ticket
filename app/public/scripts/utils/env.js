const nativeApi = require('./nativeApi');

module.exports = function getEnv() {
  const os = /(iphone|ipad)/i.test(navigator.userAgent)
    ? 'ios'
    : /android/i.test(navigator.userAgent) ? 'android' : 'unknown';

  return nativeApi.invoke('getDeviceInfo').then(
    ({ name }) => ({ os, browser: name, osVersion: iosVersion() }),
    () => ({
      os,
      osVersion: iosVersion(),
      browser: /MicroMessenger/i.test(navigator.userAgent)
        ? 'wechat'
        : /android/i.test(navigator.userAgent)
            ? 'android'
            : /safari/i.test(navigator.userAgent) ? 'safari' : 'unknown'
    })
  );
};

function iosVersion() {
  if (/(iphone|ipad|ipod)/i.test(navigator.userAgent)) {
    const [_, ver] = /OS ([\d_]+)/.exec(navigator.appVersion) || [];
    return ver ? ver.replace(/_/g, '.') : 'unknown';
  } else {
    return 'unknown';
  }
}

module.exports().then(env => console.log(JSON.stringify(env)));

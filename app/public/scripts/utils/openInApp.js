const env = require('./env')();
const queryString = require('./queryString');

/**
 * 尝试跳转到客户端内页面/下载客户端 (多数情况下需要用户交互, 仅在客户端内能保证自动跳转)
 * Native URI doc: http://gitlab.qtang.net/luolj/hbgj-api/blob/master/publicdatatype.md
 *
 * 实现由两部分组成:
 *
 * 1. 跳转动作  (openInApp)
 * - 系统浏览器
 *   + iOS 7/8: iframe跳转url scheme, 超时(没安装)则跳转到universal link
 *   + iOS 9+: 跳转universal link
 *   + Android: 跳转url scheme, 超时(没安装)则跳转到universal link
 * - 微信:
 *   + *: 跳转universal link
 * - 航班/高铁
 *   + *: 跳转url scheme
 *
 * 2. 通用下载页(universal-link)  (航班项目中的 supports/unidownload)
 * - 系统浏览器
 *   + iOS: （尝试跳转url scheme + ios banner） 若已安装，提示下拉打开 | 提示下载
 *   + Android: （尝试跳转url scheme） 提示下载
 * - 微信:
 *   + iOS: 提示点右上角safari | 提示下载
 *   + Android: 提示点右上角系统浏览器 | 提示下载
 * - 航班/高铁
 *   + *跳转url scheme
 *
 * {@link ../supports/unidownload.js }
 */
function openInApp(options = {}) {
  const appLink = `weixinhbgj://start?${queryString.build(options)}`;
  const universalLink = `https://www.133.cn/hbgj/start?${queryString.build(options)}`;
  const iosDownloadLink =
    'https://itunes.apple.com/cn/app/hang-ban-guan-jia/id320479357?mt=8';
  const otherDownloadLink =
    'http://a.app.qq.com/o/simple.jsp?pkgname=com.flightmanager.view&g_f=991610';

  return env.then(({ os, osVersion, browser }) => {
    if (/(safari|android|unknown)/i.test(browser)) {
      if (os === 'ios') {
        if (osVersion && osVersion.split('.')[0] >= 9) {
          jump(universalLink);
        } else {
          jump(appLink, iosDownloadLink, true);
        }
      } else {
        jump(appLink, otherDownloadLink);
      }
    } else if (browser === 'wechat') {
      jump(universalLink);
    } else if (browser === 'hbgj' || browser === 'gtgj') {
      jump(appLink);
    } else {
      jump(universalLink);
    }
  });
}

function jump(url, fallbackUrl, useIframe = false) {
  if (useIframe) {
    const iframe = document.createElement('IFRAME');
    iframe.src = url;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    setTimeout(function() {
      document.body.removeChild(iframe);
    }, 500);
  } else {
    location.assign(url);
  }

  if (fallbackUrl) {
    setTimeout(function() {
      location.assign(fallbackUrl);
    }, 3000);
  }
}

module.exports = openInApp;

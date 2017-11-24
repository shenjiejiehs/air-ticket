/**
 * (A Better) 微信SDK wrapper
 *
 * 1. 将微信JS-SDK的方法转换为Promise形式
 * 2. 调用微信API前自动注册(config)
 * 3. 可以使用的wx接口可参考官方文档: https://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
 *
 * !注意：某些API可能不会resolve，比如分享类，其resolve时机是用户成功分享(which你控制不了)，也可以传入success/fail回调
 */

const wx = require('../vendors/jweixin');
const sha1 = require('../vendors/sha1');
const Promise = require('./promise');
const request = require('./request');
const logger = console || require('./logger');

const APP_ID = 'wxfd7a32d944c9b3f5';
const JS_API_LIST = [
  'checkJsApi',
  'onMenuShareTimeline',
  'onMenuShareAppMessage',
  'onMenuShareQQ',
  'onMenuShareWeibo',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'translateVoice',
  'startRecord',
  'stopRecord',
  'onRecordEnd',
  'playVoice',
  'pauseVoice',
  'stopVoice',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard'
];

const TICKET_LINK = location.origin + '/promotion/wechat/ticket';

// 经验表明，在iOS下，config需要使用进入页面的第一个链接，在安卓下需要使用动态的链接，不如我们都使用一次吧
const initUrl = location.href.split('#')[0];

let wrapper = {};
for (var key in wx) {
  if (wx.hasOwnProperty(key) && typeof wx[key] == 'function') {
    wrapper[key] = promisify(wx[key].bind(wx));
  }
}

module.exports = wrapper;
module.exports.prepareShare = function({ title, link, imgUrl, desc }) {
  wrapper.onMenuShareTimeline({ title, link, imgUrl, desc });
  wrapper.onMenuShareAppMessage({ title, link, imgUrl, desc });
  wrapper.onMenuShareQQ({ title, link, imgUrl, desc });
  wrapper.onMenuShareWeibo({ title, link, imgUrl, desc });
  wrapper.onMenuShareQZone({ title, link, imgUrl, desc });
};

let cache = {
  ticket: null
};
const config = ({ url } = {}) =>
  new Promise(function(resolve, reject) {
    return Promise.resolve(
      cache.ticket
        ? { ticket: cache.ticket }
        : request({
            method: 'GET',
            url: TICKET_LINK
          })
    )
      .then(({ ticket }) => {
        cache.ticket = ticket;
        url = url || window.location.href.split('#')[0];
        const timestamp = createTimestamp();
        const nonceStr = createNonceStr();
        const signature = createSignature(ticket, nonceStr, timestamp, url);
        wx.config({
          // debug: true,
          appId: APP_ID,
          timestamp: timestamp,
          nonceStr: nonceStr,
          signature: signature,
          jsApiList: JS_API_LIST
        });
        wx.ready(resolve);
        wx.error(reject);
      })
      .catch(reject);
  });

let configPromise;
const configByDevice = () => {
  if (configPromise) {
    return configPromise;
  } else {
    const isIOS = /(iphone|ipad)/i.test(window.navigator.userAgent);
    configPromise = isIOS
      ? config({ url: initUrl }).catch(e => {
          console.error(
            '[wechat] iOS failed to config using initial url: ' + initUrl,
            e
          );
          console.info(
            '[wechat] now try using current url.' + location.href.split('#')[0]
          );
          return config();
        })
      : config().catch(e => {
          console.error(
            '[wechat] Android (or other device) failed to config using current url: ' +
              location.href.split('#')[0],
            e
          );
          console.info('[wechat] now try using initial url: ' + initUrl);
          return config({ url: initUrl });
        });
    return configPromise;
  }
};

function promisify(wxApi) {
  return (option = {}) =>
    configByDevice()
      .then(function() {
        return new Promise(function(resolve, reject) {
          option.success = option.success || resolve;
          option.fail = option.fail || reject;
          option.cancel = option.cancel || reject;
          wxApi(option);
        });
      })
      .catch(e => {
        logger.error(e, '[wechat] failed to config.');
        throw e;
      });
}

function createSignature(ticket, nonceStr, timestamp, url) {
  var o =
    'jsapi_ticket=' +
    ticket +
    '&noncestr=' +
    nonceStr +
    '&timestamp=' +
    timestamp +
    '&url=' +
    url,
    s = new sha1(o, 'TEXT'),
    h = s.getHash('SHA-1', 'HEX');
  return h;
}

function createTimestamp() {
  return String(Math.floor(new Date().valueOf() / 1000));
}

function createNonceStr(len) {
  var str = '',
    range,
    i = 0,
    o,
    arr = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
      ''
    );
  range = len && typeof len === 'number'
    ? len
    : Math.round(Math.random() * (32 - 8)) + 8;
  for (; i < range; i++) {
    o = Math.round(Math.random() * (arr.length - 1));
    str += arr[o];
  }
  return str;
}

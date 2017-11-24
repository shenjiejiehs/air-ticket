const getEnv = require('../utils/env');
const wechatHelper = require('./wechatHelper');
const nativeApi = require('./nativeApi');

const env = getEnv();

module.exports = function share({ title, desc, link, imgUrl }) {
  env.then(({ browser }) => {
    // register for wechat share
    link = link || location.href;
    if (browser === 'wechat') {
      wechatHelper.onMenuShareTimeline({
        title,
        link,
        imgUrl
      });
      wechatHelper.onMenuShareAppMessage({
        title,
        desc,
        link,
        imgUrl
      });
      wechatHelper.onMenuShareQQ({
        title,
        desc,
        link,
        imgUrl
      });
      wechatHelper.onMenuShareWeibo({
        title,
        desc,
        link,
        imgUrl
      });
    }
  });

  return () =>
    env.then(({ os, browser }) => {
      link = link || location.href;
      if (browser === 'hbgj' || browser === 'gtgj') {
        return nativeApi.invoke('sharePage', { title, desc, link, imgUrl });
      }
    });
};

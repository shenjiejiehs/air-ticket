/**
 * 获取当前用户的相关信息
 */

const request = require('utils/request');
const url = url => (window.url_base || '') + url;

module.exports = {

  getUserInfo: ({ goSmsAuthIfNeeded = false } = {}) => request({
    url: url('api/user/getUserInfo')
  }).catch(e => {
    if (goSmsAuthIfNeeded) {
      return requireAsync('smsauth/substores/authPage')
        .then(authPage => authPage.load());
    } else {
      throw e;
    }
  }),

  getDeviceInfo: () => request({
    url: url('api/user/getDeviceInfo')
  })

};



// example:
//
// module.exports.getUserInfo().then(console.log)
// module.exports.getDeviceInfo().then(console.log)

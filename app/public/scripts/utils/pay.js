const nativeApi = require('utils/nativeApi');
const request = require('utils/request');
const { log, fake, loading, catchError } = require('./decorators');
const compose = require('./compose');
const url = url => (window.url_base || '') + url;

const api = {
  getToken: compose(loading(), log('getToken'))(
    () => request({ url: url('api/user/getToken'), method: 'GET' })
  )
};

/**
 * 启动支付流程, 根据环境自动选择支付方式
 * 1. 如果在客户端内，使用客户端支付，成功支付后location.replace到订单详情页, 取消支付返回上一页
 * 2. 其他情况使用网页支付，replace到支付页，成功支付后replace到订单详情页，取消支付返回上一页(实际上已无路可退!)
 */
module.exports = pay;
/**
 * 或者，手动调用nativePay或webPay
 */
module.exports.nativePay = nativePay;
module.exports.webPay = webPay;

function pay(order, { detailUrl, briefUrl }) {
  return nativeApi
    .isAvail()
    .then(
      isNativeAvail =>
      isNativeAvail ?
      nativePay(order, { detailUrl, briefUrl }) :
      webPay(order, { detailUrl, briefUrl })
    );
}

function nativePay(order, { detailUrl, briefUrl }) {
  return nativeApi
    .invoke('startPay', {
      title: order.name,
      price: order.totalPrice,
      productdesc: order.desc,
      subdesc: '',
      orderid: order.orderId,
      url: briefUrl
    })
    .then(data => {
      if (data.value == data.SUCC || data.value == data.PENDING) {
        setTimeout(
          function() {
            location.replace(detailUrl);
          },
          500
        );
      }
    });
}

function webPay(order, { detailUrl, briefUrl }) {
  return api.getToken().then(({ token }) => {
    const params = {
      partner: 'h5store',
      token: token,
      orderId: order.orderId,
      orderType: 2,
      ru: detailUrl
    };

    const env = window.__env__;
    const payUrl = {
      dev: 'https://wtest.133.cn/hangban/webpay?',
      // dev: 'https://wtest.133.cn/dev/wangcw/hangban/webpay?',
      test: 'https://wtest.133.cn/hangban/webpay?',
      production: 'https://h5.133.cn/hangban/webpay?'
    }[env];
    const qs = Object
      .keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    window.location.replace(payUrl + qs);
  });
}

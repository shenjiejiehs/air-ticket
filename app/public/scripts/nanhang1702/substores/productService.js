const createSubstore = require('modules/createSubstore');
const request = require('utils/request');
const { log, fake, loading, catchError } = require('utils/decorators');
const compose = require('utils/compose');
const nativeApi = require('utils/nativeApi');
const url = url => (window.url_base || '') + url;

const api = {
  queryProduct: compose(loading(), log('queryProduct'))(
    ({ productId }) =>
    request({
      url: url('api/nanhang1702/queryProduct'),
      method: 'GET',
      data: { productId }
    })
  )
};

module.exports = createSubstore({
  name: 'product',
  state: {
    id: null,
    hotel: null,
    nights: null,
    inbound: null,
    outbound: null,
    price: null,
    stock: null,
    agreement: null
  },
  service: ctrl => ({
    getProduct(productId, forceUpdate = false) {
      if (!forceUpdate && ctrl.get('id')) {
        return Promise.resolve(ctrl.get(''));
      } else {
        return api.queryProduct({ productId }).then(({ product }) => {
          ctrl.set(product);
          return product;
        });
      }
    },
    goViewHotel() {
      const url = ctrl.get('hotel.url');
      const [year, month, day] = ctrl.get('outbound.fdate').split('-');
      const timestamp = new Date(year, month - 1, day).valueOf();
      // 间夜数，只是查询房价时传1
      const roomNight = 1;
      // 有NativeAPI时，使用NativeAPI开新webview，否则酒店页面回退时会关掉当前Webview
      return nativeApi.isAvail().then(isAvail => {
        const hotelUrl = [url, timestamp, roomNight].join('/');
        return isAvail ?
          nativeApi.invoke('createWebView', { url: hotelUrl }) :
          window.location.assign(hotelUrl);
      });
    }
  })
});

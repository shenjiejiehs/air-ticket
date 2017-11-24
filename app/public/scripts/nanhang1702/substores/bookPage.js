const createSubstore = require('modules/createSubstore');
const productService = require('./productService');
const orderService = require('./orderService');
const agreementPage = require('./agreementPage');
const Toast = require('components/toast');
const Popup = require('components/popup');
const Loading = require('components/loading');
const user = require('utils/user');
const datetime = require('utils/datetime');
const passengerService = require('user/services');
const map = require('utils/map');
const Promise = require('utils/promise');
const { catchError } = require('utils/decorators');
const orderDetailPage = require('./orderDetailPage');

const bookPage = createSubstore({
  name: 'bookPage',
  state: {
    productId: null,
    passengers: [],
    contact: { name: '', phone: '' },
    agreed: true
  },
  facets: {},
  service: ctrl => map(catchError)({
    load({ productId }, { isReplace } = {}) {
      ctrl.set('productId', productId);
      return productService.getProduct(productId, true).then(() =>
        ctrl.signal('::route')({
          route: 'nanhang1702/pages/book',
          isReplace
        }));
    },
    input({ key, value }) {
      ctrl.set(key, value);
    },
    addPassenger() {
      function fillContact(user) {
        const contact = ctrl.get('contact');
        if (user.name && !contact.name) {
          ctrl.set('contact.name', user.name);
        }
        if (user.phone && !contact.phone) {
          ctrl.set('contact.phone', user.phone);
        }
      }
      return user
        .getUserInfo({ goSmsAuthIfNeeded: true })
        .then(user => fillContact(user))
        .then(() => passengerService.signal('passenger.start')({
          type: 'domestic',
          passengers: ctrl.get('passengers'),
          onComplete: result =>
            bookPage.input({ key: 'passengers', value: result.passengers })
        }));
    },
    toggleAgree() {
      ctrl.set('agreed', !ctrl.get('agreed'));
    },
    goViewAgreement(e) {
      e.stopPropagation();
      return agreementPage.load();
    },
    submit() {
      const { productId, passengers, contact, agreed } = ctrl.get('');
      if (!passengers.length) {
        return Toast.show('请添加至少一位乘机人');
      }
      if (!contact.name) {
        return Toast.show('请填写联系人姓名');
      }
      if (!contact.phone) {
        return Toast.show('请填写联系电话以接收出票通知');
      }
      if (!agreed) {
        return Toast.show('请阅读并同意《周末美食游协议》');
      }

      const confirmSingle = () => passengers.length % 2 ?
        productService
        .getProduct(productId)
        .then(
          product =>
          Popup.confirm(
            `本产品单人入住需补房差${product.hotel.doubleOccupancyPrice}元`, {
              buttons: [
                { key: 'cancel', text: '取消' },
                { key: 'confirm', text: '继续预订' }
              ]
            }
          )
        )
        .then(hasConfirm => {
          if (!hasConfirm) {
            throw { isSilent: true };
          }
        }) :
        Promise.resolve(true);

      return confirmSingle()
        .then(() => user.getUserInfo({ goSmsAuthIfNeeded: true }))
        .then(() => productService.getProduct(productId))
        .then(product => {
          const { outbound, inbound, nights, price, hotel } = product;
          return orderService.createOrder({
            productId,
            name: `${inbound.dcty}往返机票+${nights}晚星级酒店`,
            amount: passengers.length,
            price: price * passengers.length,
            desc: `南航周末美食游 出发日期：${datetime.formatLocalDate(outbound.fdate)}`,
            extdata: JSON.stringify({ passengers, product, contact })
          });
        })
        .then(order => {
          return orderDetailPage.load(order.orderId, { isReplace: true });
        })
        .then(() => {
          Loading.show('正跳转至支付页');
          setTimeout(
            function() {
              return orderService
                .pay()
                .then(() => Loading.hide(), () => Loading.hide());
            },
            500
          );
        });
    }
  })
});

module.exports = bookPage;

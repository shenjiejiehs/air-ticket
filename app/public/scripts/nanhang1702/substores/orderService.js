const createSubstore = require('modules/createSubstore');
const { log, fake, loading, catchError } = require('utils/decorators');
const request = require('utils/request');
const compose = require('utils/compose');
const pay = require('utils/pay');
const url = url => (window.url_base || '') + url;

const api = {
  queryOrder: compose(loading(), log('queryOrder'))(
    ({ orderId }) => request({
      url: url('api/order/queryOrder'),
      method: 'GET',
      // lowercased field
      data: { orderid: orderId }
    })
  ),
  createOrder: compose(loading(), log('createOrder'))(
    params =>
    request({
      url: url('api/nanhang1702/createOrder'),
      method: 'POST',
      data: params
    })
  )
};

// 状态码含义 (不在文档中)
// statusMap.put(0, new GiftStatus(0, "待支付", "86,187,0,1"));
// statusMap.put(1, new GiftStatus(1, "已支付", "86,187,0,1"));
// statusMap.put(11, new GiftStatus(11, "关闭订单", "179,192,198,1"));
// statusMap.put(12, new GiftStatus(12, "成功", "86,187,0,1"));
// statusMap.put(21, new GiftStatus(21, "支付待确认", "245,153,0,1"));
// statusMap.put(22, new GiftStatus(22, "支付失败", "179,192,198,1"));
// statusMap.put(23, new GiftStatus(23, "支付成功", "86,187,0,1"));
// statusMap.put(3, new GiftStatus(3, "已退款", "179,192,198,1"));
// statusMap.put(31, new GiftStatus(31, "退款处理中", "245,153,0,1"));
// statusMap.put(32, new GiftStatus(32, "退款失败", "245,153,0,1"));
const substore = createSubstore({
  name: 'product',
  state: { id: null, order: null },
  service: ctrl => ({
    getOrder(orderId, forceUpdate = false) {
      ctrl.set('id', orderId);
      if (!forceUpdate && ctrl.get('id')) {
        return Promise.resolve(ctrl.get('order'));
      } else {
        return api.queryOrder({ orderId }).then(({ order }) => {
          ctrl.set('order', order);
          return order;
        });
      }
    },
    createOrder(params) {
      return api.createOrder(params).then(({ order }) => {
        ctrl.set({ order, id: order.orderId });
        return order;
      });
    },
    pay() {
      const order = ctrl.get('order');
      const orderId = ctrl.get('id');
      return pay(order, {
        detailUrl: window.location.href.replace(
          /nanhang1702.*$/,
          `nanhang1702/orderDetail?orderId=${orderId}`
        ),
        briefUrl: window.location.href.replace(
          /nanhang1702.*$/,
          `nanhang1702/orderDetail?brief=true&orderId=${orderId}`
        )
      });
    }
  })
});

module.exports = substore;

const createSubstore = require('modules/createSubstore');
const orderService = require('./orderService');
const map = require('utils/map');
const { catchError } = require('utils/decorators');

module.exports = createSubstore({
  name: 'orderDetailPage',
  state: { orderId: null, brief: false },
  facets: {},
  service: ctrl => map(catchError)({
    /**
     * brief: display order brief only (to be embedded in native pay page)
     */
    load(orderId, { isReplace = false, brief = false } = {}) {
      ctrl.set({ orderId, brief });
      return orderService
        .getOrder(orderId, true)
        .then(
          () =>
          ctrl.signal('::route')({
            route: 'nanhang1702/pages/orderDetail',
            isReplace
          })
        );
    },
    pay() {
      return orderService.pay();
    }
  })
});

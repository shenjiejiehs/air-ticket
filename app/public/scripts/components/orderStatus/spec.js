var m = require('m-react');
var Header = require('components/header');
var OrderStatus = require('./index');

module.exports = m.createComponent({
  title: '组件测试页：订单状态',

  render(props, state) {
    return m('.test-page', [
      m(Header, {title: this.title}),
      m('.hl-separator'),

      m(OrderStatus, {
        status: '1',
        expireTime: '',
        detail: '未支付'
      })
    ]);
  }
})

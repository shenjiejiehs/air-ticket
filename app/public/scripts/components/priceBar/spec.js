var m = require('m-react');
var Header = require('components/header');
var PriceBar = require('components/priceBar');

module.exports = m.createComponent({
  title: '组件测试：订单总价栏',
  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      m('.hl-separator'),
      m(PriceBar, {
        totalPrice: '2008',
        isAvail: false,
        onSubmit: function() {
          console.log('biu biu biu');
        }
      })
    ]);
  }
});

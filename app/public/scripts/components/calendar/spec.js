var m = require('m-react');
var dtUtil = require('utils/datetime');
var Calendar = require('./index');

var TODAY = dtUtil.TODAY;

module.exports = m.createComponent({
  title: '组件测试：多页带价格日历',
  render(props, state) {
    return m('.test-page', [
      m(Calendar, {
        title: props.title,
        minDate: '2016-10-02',
        maxDate: '2016-12-09',
        date: TODAY,
        datePrice: [{
          day: '2016-11-24',
          price: 200
        }, {
          day: TODAY,
          price: 400
        }],
        isDateInvalid: ({ day, price }) => !(!!price)
      })
    ]);
  }
});

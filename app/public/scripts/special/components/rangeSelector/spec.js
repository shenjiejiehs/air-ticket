var m = require('m-react');
var Header = require('components/header');
var RangeSelector = require('./index');

require('./spec.css');
module.exports = m.createComponent({
  title: '组件测试：Slider',
  getInitialState() {
    return {
      min: 1,
      max: 15,
      from: 5,
      to: 8,
      step: 1,
      minDifference: 0,
      maxDifference: Infinity,
      onChange: ({ from, to }) => {
        const obj = {};
        if (from) obj.from = from;
        if (to) obj.to = to;
        console.log(obj);
        this.setState(obj);
      }
    };
  },
  componentDidMount(el) {},
  render: function(props, state) {
    return m('.container', [
      m(Header, { title: this.title }),
      m(RangeSelector, this.state),
      m('', '当前输入'),
      m('pre', JSON.stringify(state, ' ', 2))
    ]);
  }
});

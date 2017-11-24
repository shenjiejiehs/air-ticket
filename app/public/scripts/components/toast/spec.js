var m = require('m-react');
var Header = require('components/header');
var toast = require('components/toast');

module.exports = m.createComponent({
  title: '组件测试：机+酒机票列表',

  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),

      m('', {
        evClick: () => toast.show('我是一个Toast')
      }, '点击显示toast')


    ]);
  }
});

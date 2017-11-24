var m = require('m-react');
var Header = require('components/header');
var Popup = require('components/popup')

module.exports = m.createComponent({
  title: '组件测试：机+酒机票列表',

  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),

      m('', {
        evClick: () => Popup.show({
          content: '我是一个自定义弹框'
        }).then(console.log)
      }, '自定义弹框'),

      m('', {
        evClick: () => Popup.alert('你正在写代码').then(console.log)
      }, '警告弹框'),

      m('', {
        evClick: () => Popup.confirm('确认要继续写代码么').then(console.log)
      }, '确认弹框')

    ])
  }
})

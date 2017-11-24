/**
 * 组件测试: 包含列表的卡片
 */
const m = require('m-react');
const Header = require('components/header');
const listCard = require('./index');


const style = ' ';

module.exports = m.createComponent({
  title: '组件测试: 包含列表的卡片',
  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      listCard({
        list: [
          m('', 'I\'m item A'),
          m('', 'I\'m item A'),
          m('', 'I\'m item A'),
          m('', 'I\'m item A'),
          m('', 'I\'m item A')

        ]
      })
    ]);
  }
});

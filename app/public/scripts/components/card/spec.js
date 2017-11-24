/**
 * 组件测试: 卡片
 */
const m = require('m-react');
const Header = require('components/header');
const Card = require('./index');


const style = ' ';

module.exports = m.createComponent({
  title: '组件测试: 卡片',
  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),

      [false, true].map(
        shadow => [false, true].map(
          hole => ['none', 'dashed', 'solid'].map(
            divider => Card({
              shadow,
              hole,
              divider,
              title: '我是一张卡片',
              content: JSON.stringify({ shadow, hole, divider }, null, 2)
            })
          )
        )
      ),

      Card({
        shadow: true,
        title: '只有标题'
      }),

      Card({
        shadow: true,
        content: '只有内容'
      }),

      Card({
        shadow: true,
        padding: false,
        content: '只有内容, 没有padding'
      })

    ]);
  }
});

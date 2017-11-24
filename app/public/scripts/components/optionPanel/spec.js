var m = require('m-react');
var Header = require('components/header');
var optionPanel = require('components/optionPanel');

module.exports = m.createComponent({
  title: '组件测试：数字选择器',

  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      m('.hl-separator'),

      m(
        'button.hl-btn',
        {
          onclick: () =>
            optionPanel
              .select({
                title: '选择邮寄方式',
                options: [
                  {
                    name: '快递',
                    desc: '快递（消耗1000积分）',
                    value: '0'
                  },
                  {
                    name: '挂号信',
                    desc: '挂号信（消耗500积分）',
                    value: '1',
                    selected: true
                  },
                  {
                    name: '自取2',
                    desc: '自取2',
                    value: '2'
                  }
                ]
              })
              .then(console.log)
        },
        '弹出'
      )
    ]);
  }
});

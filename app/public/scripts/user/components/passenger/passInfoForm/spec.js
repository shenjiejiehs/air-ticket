var m = require('m-react');
var Header = require('components/header');
var PassInfoForm = require('./index');

module.exports = m.createComponent({
  title: '组件测试：乘机人表单',

  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),

      m(PassInfoForm, {
        type: 'domestic',
        action: 'edit',
        info: {

        },
        onInput: (key, value) => {
          console.log(key, value);
        },
        onSubmit: (action, info) => {
          console.log(action, info);
        }
      })
    ]);
  }
});

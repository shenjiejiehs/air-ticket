const m = require('m-react');
const Header = require('components/header');
const Input = require('./index');

module.exports = m.createComponent({
  title: '组件测试页：输入栏',

  getInitialState() {
    return {
      name: '',
      phone: '',
      date: ''
    };
  },

  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),

      m('.hl-separator'),
      m(Input, {
        type: 'text',
        key: 'name',
        value: state.name,
        label: '姓名',
        placeholder: '请输入姓名',
        isRequired: true, // 是否加*强调
        onInput: (key, value) => {
          this.setState({
            name: value
          });
          console.log(key, value);
        }
      }),

      m('.hl-separator'),
      m(Input, {
        type: 'tel',
        key: 'phone',
        value: state.phone,
        label: '手机',
        placeholder: '请输入手机号码',
        isRequired: false,
        onInput: (key, value) => {
          this.setState({
            phone: value
          });
          console.log(key, value);
        },

        labelStyle: 'hl-text-gray',
        inputStyle: 'hl-input-border.hl-text-right'
      }),

      m('.hl-separator'),
      m(Input, {
        type: 'date',
        key: 'date',
        value: state.date,
        label: '生日',
        placeholder: '请输入生日',
        isRequired: false,
        onInput: (key, value) => {
          this.setState({
            date: value
          });
          console.log(key, value);
        },
        onChange: (key, value) => {
          console.log('change');
          console.log(key, value);
        }
      })
    ]);
  }
});

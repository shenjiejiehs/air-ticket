var m = require('m-react');
var Header = require('components/header');
var contactInfo = require('./index');

module.exports = m.createComponent({
  title: '组件测试页：联系人信息',

  getInitialState() {
    return {
      name: '测试',
      phone: '15252525252'
    };
  },

  render(props, state) {

    return m('.test-page', [

      m(Header, { title: this.title }),

      m(contactInfo, {
        name: state.name,
        phone: state.phone,
        // onInput: () => {},
        onChooseContact: ({ name, phone }) => this.setState({
          name: name,
          phone: phone
        })
      })
    ]);
  }
});

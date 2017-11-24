const m = require('m-react');
const Header = require('components/header');
const Toggle = require('./index');

module.exports = m.createComponent({
  title: '组件测试页：开关按钮',

  getInitialState() {
    return {
      isActive: true
    };
  },

  render(props, state) {

    return m('.test-page', [

      m(Header, { title: this.title }),

      m(Toggle, {
        isActive: state.isActive,
        onToggle: isActive => this.setState({
          isActive: isActive
        })
      }),

      m(Toggle, {
        isActive: state.isActive,
        type: 'circle',
        onToggle: isActive => this.setState({
          isActive: isActive
        })
      }),

      m(Toggle, {
        isActive: state.isActive,
        type: 'square',
        onToggle: isActive => this.setState({
          isActive: isActive
        })
      })
    ]);
  }
});

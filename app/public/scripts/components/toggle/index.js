const m = require('m-react');

require('css/flex.css');
require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    isActive: true,
    type: 'toggle', // 显示样式 toggle/circle/square
    size: '', // 大小  ''/'lg'/'sm'
    onToggle: console.log
  },

  render(props, state) {
    const { isActive, type, size, onToggle } = props;
    return m('.toggle', {
      onclick: () => onToggle(!isActive)
    }, [
      type === 'toggle' ?
      m('.hl-btn.hl-btn-toggle' + (isActive ? '.hl-active' : '') + (size && `.${size}`)) :

      type === 'circle' ?
      m('.btn-toggle-circle' + (isActive ? '.active' : '') + (size && `.${size}`)) :

      type === 'square' ?
      m('.btn-toggle-square' + (isActive ? '.active' : '') + (size && `.${size}`)) :

      null
    ]);
  }
});

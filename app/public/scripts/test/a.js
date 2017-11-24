var m = require('m-react');

var injectCtrls = require('modules/mixins/injectCtrls');
require('css/./a.css');
module.exports = m.createComponent({
  defaultProps: {
    placeholder: 'input a number here'
  },
  selectors: {
    'a': 'test.a',
    'b': 'test.b'
  },
  facets: {
    'sum': 'test.sum',
    'navState': 'nav.menuState'
  },
  onInput: function(key, e){
    var update = {};
    update[key] = Number(e.target.value) || 0;
    this.signal('test.update')(update);
  },
  render: function(props, state){
    return m('.input', [
      m('input.a-input',{
        type: 'text',
        placeholder: props.placeholder,
        value: state.a,
        evInput: this.onInput.bind(null, 'a')
      }),
      m('input.b-input',{
        type: 'text',
        placeholder: props.placeholder,
        value: state.b,
        evInput: this.onInput.bind(null, 'b')
      }),
      m('h4.result', 'a + b = ' + state.sum),
      m('p', JSON.stringify(props)),
      m('p', JSON.stringify(state.navState))
    ]);
  }
}, [injectCtrls({
  'test': require('services/test'),
  'nav': require('services/navigator')
})]);

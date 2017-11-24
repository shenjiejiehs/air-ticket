var m = require('m-react');

var injectCtrls = require('modules/mixins/injectCtrls');

module.exports = m.createComponent({
  defaultProps: {
    placeholder: 'input a number here'
  },
  selectors: {
    'c': 'test1.c',
    'd': 'test1.d'
  },
  facets: {
    'sum': 'test1.sum'
  },
  onInput: function(key, e){
    var update = {};
    update[key] = Number(e.target.value) || 0;
    this.signal('test1.update')(update);
  },
  render: function(props, state){
    return m('.input', [
      m('input.c-input',{
        type: 'text',
        placeholder: props.placeholder,
        value: state.c,
        evInput: this.onInput.bind(null, 'c')
      }),
      m('input.d-input',{
        type: 'text',
        placeholder: props.placeholder,
        value: state.d,
        evInput: this.onInput.bind(null, 'd')
      }),
      m('h4.result', 'c + d = ' + state.sum)
    ]);
  }
}, [injectCtrls({
  'test1': require('services/test1')
})]);

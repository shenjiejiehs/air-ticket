const m = require('m-react');
require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    type: 'text',
    key: '',
    value: '',
    label: '',
    placeholder: '请输入',
    isRequired: false, // 是否加*强调
    onInput: () => {},
    onChange: () => {}

    // optional props
    // labelWrapperStyle: ['hl-col-6', 'hl-text-sm'] or 'hl-text-sm',
    // labelStyle: [] or '',
    // inputWrapperStyle: [] or '',
    // inputStyle: [] or ''
  },

  render: function(props, state) {
    const labelWrapperName = setStyle(props.labelWrapperStyle, 'labelWrapper');
    const labelName = setStyle(props.labelStyle, 'label');
    const inputWrapperName = setStyle(props.inputWrapperStyle, 'inputWrapper');
    const inputName = setStyle(props.inputStyle, 'input');

    return m('.simple-input', [
      m('.hl-row.hl-relative', [
        props.isRequired ? m('.label-required', '*') : null,
        m(labelWrapperName, [
          m(labelName, props.label || '')
        ]),

        props.type === 'date' ?
        // 日期输入控件
        m(inputWrapperName + '.hl-relative', [
          // for better display
          m(inputName, [
            m('span' + (props.value ? '' : '.hl-text-blue'), props.value || props.placeholder),
            m('span.hl-middle-R.icon-dropdown')
          ]),
          // transparent
          m('input.hl-input-nopadding.hl-select-holder', {
            value: props.value || null,
            placeholder: props.placeholder,
            type: props.type,
            evInput: e => props.onInput(props.key, e.target.value),
            evChange: e => props.onChange(props.key, e.target.value)
          })
        ]) :

        m(inputWrapperName, [
          m('input.hl-input-nopadding' + inputName, {
            value: props.value || null,
            placeholder: props.placeholder,
            type: props.type,
            evInput: e => props.onInput(props.key, e.target.value),
            evChange: e => props.onChange(props.key, e.target.value)
          })
        ])
      ])
    ]);
  }
});

function setStyle(styles, type) {
  const styleList = [].concat(styles).filter(Boolean);
  let result = '';

  if (styleList.length) {
    result = styleList.join('.');
    result = '.' + result;
  } else {
    if (type === 'labelWrapper') {
      result = '.hl-col-4';
    }

    if (type === 'inputWrapper') {
      result = '.hl-col-8';
    }
  }

  return result;
}

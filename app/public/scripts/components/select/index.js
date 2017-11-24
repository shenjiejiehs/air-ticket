const m = require('m-react');
const find = require('common/l/find');

require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    type: 'select', // to do: use 'optionPannel' component
    key: '',
    selected: {}, // or '', selected option object or option value
    label: '',
    placeholder: '请选择',
    isRequired: false, // 是否加*强调
    options: [{
      name: '', // [必须], option名称
      desc: '', // [可选], option显示的名称
      value: '', // [必须], option实际传递的值, 必须唯一
      disabled: false // [可选], option是否被禁用
    }],
    onChange: function() {}

    // optional props
    // labelWrapperStyle: [] or '',
    // labelStyle: [] or '',
    // selectWrapperStyle: [] or '',
    // selectStyle: [] or '',
  },

  onChange: function(value) {
    const selected = find(function(item) {
      return item.value == value;
    }, this.props.options);

    this.props.onChange(this.props.key, selected);
  },

  render: function(props, state) {
    const labelWrapperName = setStyle(props.labelWrapperStyle, 'labelWrapper');
    const labelName = setStyle(props.labelStyle, 'label');
    const selectWrapperName = setStyle(props.selectWrapperStyle, 'selectWrapper');
    const selectName = setStyle(props.selectStyle, 'select');

    let selected = props.selected;
    if (typeof props.selected === 'string' || typeof props.selected === 'number') {
      selected = find(function(item) {
        return item.value == selected;
      }, props.options) || {};
    }

    return m('.simple-select', [
      m('.hl-row.hl-relative', [
        props.isRequired ? m('.label-required', '*') : null,
        m(labelWrapperName, [
          m(labelName, props.label || '')
        ]),
        m(selectWrapperName + '.hl-relative', [
          // for better display
          m(selectName, [
            m('span' + (selected.name ? '' : '.hl-text-blue'), selected.name || props.placeholder),
            m('span.hl-middle-R.icon-dropdown')
          ]),
          // transparent
          m('select.hl-select-holder', {
            evChange: e => this.onChange(e.target.value)
          }, [].concat(dumbOption(), props.options.map(option => {
            let attrs = {
              value: option.value
            };

            if (option.disabled) {
              attrs.disabled = 'disabled';
            }

            if (option.value == selected.value) {
              attrs.selected = 'selected';
            }

            return m('option', attrs, option.desc || option.name || '--');
          })))
        ])
      ])
    ]);
  }
});

// without it, 'onchange' event will not fire when first
// option is selected for the first time, as it is already
// selected by default.
// see: http://stackoverflow.com/questions/8605516/default-select-option-as-blank
function dumbOption() {
  return m('option', {
    selected: true,
    disabled: true,
    style: { display: 'none' }
  }, '');
}

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

    if (type === 'selectWrapper') {
      result = '.hl-col-8';
    }
  }

  return result;
}

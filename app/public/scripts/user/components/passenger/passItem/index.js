const m = require('m-react');
require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    passenger: {},
    enableSelect: false,
    showSelectIcon: false,
    selectPassenger: function() {},
    editPassenger: function() {}
  },

  render(props, state) {
    const { passenger, enableSelect, showSelectIcon } = props;
    return m('.pass-item.hl-list-group-item', [
      m('.hl-row.hl-relative', [
        m('.hl-col-10', {
          evClick: props.selectPassenger.bind(null, passenger)
        }, [
          enableSelect && showSelectIcon ?
          m('.hl-inline-block.hl-list-item-icon.hl-margin-right' + (passenger.selected ?
            '.icon-selected' :
            '.icon-unselected'
          )) : null,

          m('.hl-inline-block', [
            m('', [
              m('.hl-inline-block.hl-margin-right', passenger.name ? passenger.name : passenger.ename),
              passenger.type === 'CHD' ? [m('.hl-inline-block.icon-person'), m('.hl-inline-block.hl-text-sm.hl-text-gray', '儿童')] : null
            ]),
            m('.hl-text-sm.hl-text-gray', passenger.itn + ' ' + passenger.idcard),
            passenger.phone ? null : m('.hl-text-xs.hl-text-blue', '请补充乘机人手机号')
          ])
        ]),

        m('.hl-col-2.hl-full-height-R', {
          evClick: props.editPassenger.bind(null, passenger)
        }, m('.hl-middle-R.hl-list-item-icon.icon-edit'))
      ])
    ]);
  }
});

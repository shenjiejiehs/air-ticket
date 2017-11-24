const m = require('m-react');
require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    passengers: [{
      name: '', // 中文名
      ename: '', // 音文名
      idtype: '0',
      idcard: '',
      itn: '身份证',
      type: 'ADT' // 'ADT' 成人，'CHD': 儿童
    }],
    onDelete: function() {},
    onAdd: function() {}
  },

  onClick(props) {
    props.onAdd();
  },

  onDelete(props, idx) {
    props.passengers.splice(idx, 1);
    props.onDelete(props.passengers);
  },

  render(props, state) {
    const { passengers } = props;
    return m('.passengerInfo.hl-list-group.hl-list-group-indent', passengers.map((pass, idx) => {
      return m('.hl-list-group-item', [
        m('span.hl-indent-icon.icon-delete', {
          evClick: this.onDelete.bind(null, props, idx)
        }),
        m('', [
          m('.hl-inline-block.hl-margin-right', pass.name || pass.ename),
          pass.type === 'CHD' ? [m('.hl-inline-block.icon-person'), m('.hl-inline-block.hl-text-sm.hl-text-gray', '儿童票')] : null
        ]),
        m('.hl-text-sm.hl-text-gray', pass.itn + ' ' + pass.idcard)
      ]);
    }).concat(m('.hl-list-group-item', {
      evClick: this.onClick.bind(null, props)
    }, [
      m('span.hl-indent-icon.icon-add'),
      m('.hl-text-blue', passengers.length ? '添加/修改乘机人' : '添加乘机人'),
      m('.hl-right.icon-arrow-right')
    ])));
  }
});

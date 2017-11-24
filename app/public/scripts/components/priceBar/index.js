var m = require('m-react');

require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    title: '订单总额',
    btnText: '立即预订',
    totalPrice: '0',
    isAvail: true,
    onSubmit: function() {}
  },

  render: function(props, state) {
    return m('.price-bar.hl-relative', [
      m('.hl-bar-footer-placeholder'),
      m('.hl-fix-bottom.hl-bar-footer.hl-relative', [
        m('.hl-middle.hl-margin-left', [
          m('.hl-text-xs', props.title),
          m('.hl-text-orange', [
            m('span', '¥'),
            m('span.price', props.totalPrice.toString())
          ])
        ]),
        m('.hl-middle-R.hl-margin-right', [
          m('button.hl-btn.hl-btn-primary' + (props.isAvail ? '' : '.hl-disabled'), {
            evClick: props.isAvail && props.onSubmit
          }, m('.hl-text-lg', props.btnText))
        ])
      ])
    ]);
  }
});

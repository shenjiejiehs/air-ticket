const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');

const services = require('../../services');
const Header = require('components/header');
const PassItem = require('../../components/passenger/passItem');

require('./list.css');

module.exports = m.createComponent({
  title: '乘机人',
  selectors: {
    type: 'user.passenger.type',
    enableSelect: 'user.passenger.enableSelect',
    multiSelect: 'user.passenger.multiSelect',
    list: 'user.passenger.list'
  },

  componentWillMount() {
    this.signal('user.passenger.list.load')();
  },

  render(props, state) {
    const { type, enableSelect, multiSelect, list } = state;
    return m('#passenger-list-page', [
      m(Header, { title: this.title }),

      m('.hl-box-border', {
        evClick: this.signal('user.passenger.edit.load').bind(null, { type: type, action: 'add', info: {} })
      }, [
        m('.hl-inline-block.icon-add'),
        m('.hl-inline-block.hl-text-blue', '添加新乘机人')
      ]),

      m('.hl-separator.hl-text-blue.hl-text-xs.hl-padding-left', {
        evClick: this.signal('user.passenger.remind.load')
      }, [
        m('.hl-inline-block.icon-remind'),
        m('.hl-inline-block', '乘机要求与特殊旅客详细说明')
      ]),
      m('.hl-list-group.hl-list-group-pl', list.map((passenger, idx) => m(PassItem, {
        passenger: passenger,
        enableSelect: enableSelect,
        showSelectIcon: multiSelect,
        selectPassenger: this.signal('user.passenger.list.select').bind(null, { passenger, idx }),
        editPassenger: this.signal('user.passenger.edit.load').bind(null, { type: passenger.countrytype || type, action: 'edit', info: passenger })
      }))),

      enableSelect ? [
        m('.hl-separator'),
        m('.hl-bar-footer-placeholder'),
        m('.hl-fix-bottom.hl-bar-footer',
          m('.hl-btn.hl-btn-submit.hl-btn-primary', {
            evClick: this.signal('user.passenger.list.submit')
          }, '确 定')
        )
      ] : null
    ]);
  }
}, [injectCtrls({ user: services })]);

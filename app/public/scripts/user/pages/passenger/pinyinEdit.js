const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');

const Header = require('components/header');
const services = require('../../services');

require('./pinyinEdit.css');

module.exports = m.createComponent({
  title: '编辑姓名拼音',

  selectors: {
    pinyin: 'user.passenger.pinyinEdit.pinyin',
    chinesename: 'user.passenger.pinyinEdit.chinesename',
    chinesepinyin: 'user.passenger.pinyinEdit.chinesepinyin'
  },

  render(props, state) {
    const { pinyin, chinesepinyin } = state;
    return m('#passenger-pinyinEdit-page', [
      m(Header, { title: this.title }),
      m('.pinyin-content', [
        m('.hl-tips.hl-text-sm', '预订部分航班机票或乘机人姓名中含有生僻字时，需提交乘机人姓名拼音，请仔细核对'),
        m('.hl-list-group', pinyin.map((item, index) => {
          return [
            m('.hl-list-group-item', [
              m('.hl-row', [
                m('.hl-col-4', [
                  m('span.hl-text-red', item.name),
                  m('span.hl-margin-left', '字拼音')
                ]),
                m('.hl-col-8', [
                  m('input.hl-input-nopadding', {
                    value: chinesepinyin[index].value,
                    evInput: e => this.signal('user.passenger.pinyinEdit.input')({
                      index: index,
                      name: item.name,
                      value: e.target.value
                    })
                  })
                ])
              ])
            ]),
            item.value.split(',').length > 1 ?
            m('.hl-list-group-item.hl-text-sm', [
              m('span.hl-text-green.hl-margin-right', '*'),
              m('span', `“${item.name}”为多音字( ${getComplexPinyin(item.value)} ), 请输入与登机牌一致的拼音`)
            ]) : null
          ];
        }))
      ]),

      m('.hl-btn.hl-btn-submit.hl-btn-primary', {
        evClick: this.signal('user.passenger.pinyinEdit.submit').bind(null, {
          chinesepinyin: chinesepinyin
        })
      }, '保 存')
    ]);
  }
}, [injectCtrls({ user: services })]);

function getComplexPinyin(pinyinStr) {
  return pinyinStr.split(',').join('或');
}

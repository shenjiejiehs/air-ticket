const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');

const services = require('../../services');
const Header = require('components/header');
const Input = require('components/input');
const PassInfoForm = require('../../components/passenger/passInfoForm');
const request = require('utils/request');

require('./edit.css');

module.exports = m.createComponent({
  title: '编辑乘机人',
  selectors: {
    type: 'user.passenger.edit.type',
    action: 'user.passenger.edit.action',
    formOptions: 'user.passenger.edit.formOptions',
    info: 'user.passenger.edit.info'
  },

  componentDidMount() {
    this.setState({
      isChineseNameShow: isNameSwitchBtnShow(this.state.info.idtype) && !this.state.info.name ? false : true
    });
  },

  onGetPinyin(chineseName) {
    const regularExp = /^[\u4e00-\u9fa5]+$/;
    regularExp.test(chineseName) ?
      request({
        url: window.url_base + 'api/user/pinyin',
        method: 'GET',
        data: {
          name: chineseName
        }
      }).then(result => {
        const pinyinArr = [].concat(result.pinyin).filter(Boolean);
        const chinesepinyin = pinyinArr.map(item => {
          return {
            name: item.name,
            value: item.value.split(',')[0]
          };
        });
        this.signal('user.passenger.edit.input')({ key: 'chinesepinyin', value: chinesepinyin });
      }).catch(() => {
        this.signal('user.passenger.edit.input')({ key: 'chinesepinyin', value: null });
      }) :
      this.signal('user.passenger.edit.input')({ key: 'chinesepinyin', value: null });
  },

  onToggleName() {
    this.setState({ isChineseNameShow: !this.state.isChineseNameShow });
  },

  render(props, state) {
    const { type, action, formOptions, info, isChineseNameShow } = state;
    return m('#passenger-edit-page', [
      m(Header, { title: action === 'add' ? '添加乘机人' : '修改乘机人' }),

      // passenger name
      m('.hl-list-group.hl-list-group-pl', [
        m('.hl-list-group-item', [
          m('.hl-row', [
            m('.hl-col-6', {
              evClick: this.signal('user.passenger.nameGuide.load')
            }, [
              m('.hl-inline-block.hl-text-gray.hl-text-sm', '乘机人姓名'),
              m('.hl-inline-block.icon-question')
            ]),
            m('.hl-col-6.hl-text-right', [
              isNameSwitchBtnShow(info.idtype) ?
              m('.hl-inline-block.hl-text-xs.btn-toggle.inter', {
                evClick: this.onToggleName
              }, [
                m('span.hl-inline-block.inter-name' + (isChineseNameShow ? '.active' : ''), isChineseNameShow ? '中文名' : '中'),
                m('span.hl-inline-block.inter-name' + (isChineseNameShow ? '' : '.active'), isChineseNameShow ? '英' : '英文名')
              ]) : null
            ])
          ])
        ]),
        isChineseNameShow ? [
          m('.hl-list-group-item', [
            m(Input, {
              key: 'name',
              value: info.name,
              label: '中文姓名',
              placeholder: '请填写中文姓名',
              onInput: (key, value) => {
                this.onGetPinyin(value);
                this.signal('user.passenger.edit.input')({ key: key, value: value });
              }
            })
          ]),
          m('.hl-list-group-item', [
            m('.simple-input', [
              m('.hl-row', [
                m('.hl-col-4', '姓名拼音'),
                m('.hl-col-8.hl-relative', {
                  evClick: getPinyin(info.chinesepinyin) ? this.signal('user.passenger.pinyinEdit.load').bind(null, {
                    chinesename: info.name,
                    chinesepinyin: info.chinesepinyin
                  }) : null
                }, [
                  m('span' + (getPinyin(info.chinesepinyin) ? '' : '.hl-text-graylight'), getPinyin(info.chinesepinyin) ? getPinyin(info.chinesepinyin) : '根据中文名自动生成'),
                  getPinyin(info.chinesepinyin) ? m('span.hl-middle-R.icon-arrow-right') : null
                ])
              ])
            ])
          ])
        ] : [
          m('.hl-list-group-item', [
            m(Input, {
              key: 'elastn',
              value: info.elastn,
              label: '英文姓',
              placeholder: '如张小航填写为:ZHANG',
              onInput: (key, value) => {
                this.signal('user.passenger.edit.input')({ key: key, value: value });
              }
            })
          ]),
          m('.hl-list-group-item', [
            m(Input, {
              key: 'en',
              value: info.en,
              label: '英文名',
              placeholder: '如张小航填写为:XIAOHANG',
              onInput: (key, value) => {
                this.signal('user.passenger.edit.input')({ key: key, value: value });
              }
            })
          ])
        ]
      ]),

      m('.hl-separator'),
      // passenger info (birthday, gender, phone)
      m(PassInfoForm, {
        type: type,
        action: action,
        formOptions: formOptions,
        info: info,
        onInput: (key, value) => this.signal('user.passenger.edit.input')({ key: key, value: value })
      }),

      // 添加和编辑乘机人
      m('.hl-btn.hl-btn-submit.hl-btn-primary', {
        evClick: this.signal('user.passenger.edit.submit').bind(null, { action: action, passenger: info })
      }, '保 存'),

      // 删除乘机人
      action === 'add' ? null :
      m('.hl-btn.hl-btn-submit.hl-btn-plain', {
        evClick: this.signal('user.passenger.edit.submit').bind(null, { action: 'delete', passenger: info })
      }, '删 除')
    ]);
  }
}, [injectCtrls({ user: services })]);

// helper
function getPinyin(chinesepinyin) {
  const pinyinArr = [].concat(chinesepinyin).filter(Boolean);
  const pinyin = pinyinArr.map(item => {
    if (item.value) {
      return item.value.split(',')[0];
    } else {
      return '';
    }
  }).join(' ');
  return pinyin.trim();
}

// 护照／其他／港澳通行证显示中英文姓名切换按钮
function isNameSwitchBtnShow(idtype) {
  return ['1', '2', '6'].indexOf(idtype) >= 0;
}

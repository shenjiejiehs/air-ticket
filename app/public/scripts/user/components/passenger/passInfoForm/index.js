const m = require('m-react');
const Input = require('components/input');
const Select = require('components/select');
const Toggle = require('components/toggle');

const find = require('../../../../../common/l/find');
const { getDateByIdCard, getGenderByIdCard } = require('utils/bankcard');

require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    type: 'domestic',

    // 表单select选项
    formOptions: {
      // idtype: [],
      // passtype: [],
      // gender: []
    },
    info: {
      // psid: 1,

      // 中文乘机人
      // name: '张三',
      // lastn: '姓',
      // cn: '三',

      // 英文乘机人
      // ename: 'ZHANG/SAN'
      // elastn: 'ZHANG',
      // en: 'SAN',

      // type: 'ADT',
      // idtype: '0',  // 证件类型
      // itn: '身份证' // 证件名称
      // idcard: '', // 证件号
      // birthday: '',
      // gender: '男',
      // countrytype: '', // 'domestic': 国内，'international': 国际
      // validate: '2020-01-01'// 证件有效期,
      // nationality: '国籍',
      // nationalityid: 1,  // 国际id
      // phone: '',
      // pinyin: '',  // 生僻字出现
      // myself: 0, // 0: 不是本人, 1: 本人
      // chinesepinyin: [{name: '', value: ''}], // json数组,
      // common: 0 // 0: 非常用乘机人, 1: 常用乘机人
    },
    onInput: () => {},
    onSubmit: () => {}
  },

  componentWillMount() {
    // update 乘机人国籍类型
    this.props.onInput('countrytype', this.props.type);
  },

  // to do: 国际乘机人选择国籍
  onChooseNationality() {

  },

  render(props, state) {
    const { type, formOptions, info, onInput, onSubmit } = props;
    const isInputNeed = [].concat(formOptions.idtype).filter(item => {
      return ['护 照', '户口本', '港澳通行证'].indexOf(item.name) >= 0;
    }).map(item => {
      return item.value;
    }).indexOf(info.idtype) >= 0;


    return m('.pass-info-form', [
      m('.hl-list-group.hl-list-group-pl', [
        m('.hl-list-group-item', [
          m(Select, {
            key: 'idtype',
            selected: info.idtype,
            label: '证件类型',
            placeholder: '请选择证件类型',
            options: formOptions.idtype,
            onChange: (key, selected) => {
              props.onInput(key, selected.value);
            }
          })
        ]),
        m('.hl-list-group-item', [
          m(Input, {
            key: 'idcard',
            value: info.idcard,
            label: '证件号码',
            placeholder: '请输入证件号码',
            onInput: (key, value) => {
              props.onInput(key, value);
            },
            onChange: (key, value) => {
              props.onInput('birthday', getDateByIdCard(value));
              props.onInput('gender', getGenderByIdCard(value));
            }
          })
        ]), isInputNeed ?
        m('.hl-list-group-item', [
          m(Input, {
            type: 'date',
            key: 'validate',
            value: info.validate,
            label: '证件有效期',
            placeholder: '请选择证件有效期',
            onInput: (key, value) => {
              props.onInput(key, value);
            }
          })
        ]) : null,
        m('.hl-list-group-item', [
          m(Select, {
            key: 'type',
            selected: info.type,
            label: '乘机人类型',
            placeholder: '请选择乘机人类型',
            options: formOptions.passtype,
            onChange: (key, selected) => {
              props.onInput(key, selected.value);
            }
          })
        ]),
        m('.hl-list-group-item', [
          m(Input, {
            type: 'date',
            key: 'birthday',
            value: info.birthday,
            label: '出生日期',
            placeholder: '请选择日期',
            onInput: (key, value) => {
              props.onInput(key, value);
            }
          })
        ]),

        // to do: 选择国籍页面
        isInputNeed ?
        m('.hl-list-group-item', [
          m(Select, {
            key: 'nationality',
            selected: info.nationality,
            label: '国籍',
            placeholder: '请选择国籍',
            onChange: (key, selected) => {
              props.onInput(key, selected.value);
            }
          })
        ]) : null,
        m('.hl-list-group-item', [
          m(Select, {
            key: 'gender',
            selected: info.gender,
            label: '性别',
            placeholder: '请选择性别',
            options: formOptions.gender,
            onChange: (key, selected) => {
              props.onInput(key, selected.value);
            }
          })
        ]),
        m('.hl-list-group-item', [
          m(Input, {
            type: 'tel',
            key: 'phone',
            value: info.phone,
            label: '手机号码',
            placeholder: '接收短信通知(选填)',
            onInput: (key, value) => {
              props.onInput(key, value);
            }
          })
        ])
      ]),

      m('.hl-separator'),
      m('.hl-box-border', [
        m('.hl-row.hl-relative', [
          m('.hl-col-9', '设置为常用乘机人'),
          m('.hl-col-3.hl-middle-R.hl-text-right', [
            m(Toggle, {
              isActive: info.common == '1' ? true : false,
              onToggle: isActive => {
                props.onInput('common', isActive ? '1' : '0');
              }
            })
          ])
        ])
      ]),

      m('.hl-separator'),
      m('.hl-box-border', [
        m('.hl-row.hl-relative', [
          m('.hl-col-9', '这是我自己'),
          m('.hl-col-3.hl-middle-R.hl-text-right', [
            m(Toggle, {
              isActive: info.myself == '1' ? true : false,
              onToggle: isActive => {
                props.onInput('myself', isActive ? '1' : '0');
              }
            })
          ])
        ])
      ])
    ]);
  }
});

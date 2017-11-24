const m = require('m-react');
const Header = require('components/header');
const Select = require('./index');

module.exports = m.createComponent({
  title: '组件测试页：选择栏',

  getInitialState() {
    return {
      idtype: {},
      bank: {},
      idtype2: {},
      idtype3: {}
    };
  },

  render(props, state) {

    return m('.test-page', [
      m(Header, { title: this.title }),

      m('.hl-separator'),
      m(Select, {
        key: 'idtype',
        selected: state.idtype,
        label: '证件类型',
        placeholder: '请选择证件类型',
        isRequired: true, // 是否加*强调
        options: [{
          name: '身份证',
          desc: '身份证',
          value: 'ID'
        }, {
          name: '护照',
          desc: '护照',
          value: 'PP'
        }, {
          name: '其他',
          desc: '其他证件',
          value: 'other'
        }],
        onChange: (key, selected) => {
          this.setState({
            idtype: selected
          });
          console.log(selected);
        }
      }),

      m('.hl-separator'),
      m(Select, {
        key: 'bank',
        selected: state.bank,
        label: '银行',
        placeholder: '请选择银行',
        isRequired: false,
        options: [{
          name: '中行',
          desc: '中国银行',
          value: 1
        }, {
          name: '工行',
          desc: '中国工商银行',
          value: 2
        }, {
          name: '建行',
          desc: '中国建设银行',
          value: 3
        }, {
          name: '农行',
          desc: '中国农业银行',
          value: 4,
          disabled: true
        }],
        onChange: (key, selected) => {
          this.setState({
            bank: selected
          });
          console.log(selected);
        },

        labelStyle: 'hl-text-gray'
      }),

      m('.hl-separator'),
      m('.hl-list-group.hl-list-group-pl', [
        m('.hl-list-group-item', [
          m(Select, {
            key: 'idtype',
            selected: state.idtype2,
            label: '证件类型',
            placeholder: '请选择证件类型',
            isRequired: true, // 是否加*强调
            options: [{
              name: '身份证',
              desc: '身份证',
              value: 'ID'
            }, {
              name: '护照',
              desc: '护照',
              value: 'PP'
            }, {
              name: '其他',
              desc: '其他证件',
              value: 'other'
            }],
            onChange: (key, selected) => {
              this.setState({
                idtype2: selected
              });
              console.log(selected);
            }
          })
        ]),

        m('.hl-list-group-item', [
          m(Select, {
            key: 'idtype',
            selected: state.idtype3,
            label: '证件类型',
            placeholder: '请选择证件类型',
            isRequired: true, // 是否加*强调
            options: [{
              name: '身份证',
              desc: '身份证',
              value: 'ID'
            }, {
              name: '护照',
              desc: '护照',
              value: 'PP'
            }, {
              name: '其他',
              desc: '其他证件',
              value: 'other'
            }],
            onChange: (key, selected) => {
              this.setState({
                idtype3: selected
              });
              console.log(selected);
            }
          })
        ])
      ])
    ]);
  }
});

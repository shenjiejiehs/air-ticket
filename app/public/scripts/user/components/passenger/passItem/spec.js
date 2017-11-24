var m = require('m-react');
var Header = require('components/header');
var PassItem = require('./index');

module.exports = m.createComponent({
  title: '组件测试：乘机人Item',
  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      m('.hl-separator'),
      m('.hl-list-group', [
        m(PassItem, {
          passenger: {
            psid: '1', // id号，供编辑和删除使用
            name: '徐洋',
            type: 'ADT', // 'ADT'成人 'CHD':儿童
            idcard: '123',
            idtype: '0', // '0':身份证 '1':护照
            itn: '身份证',
            myself: '1', // '0': 他人，'1': 自己
            countrytype: 'domestic'
          },
          enableSelect: false,
          showSelectIcon: false,
          selectPassenger: function() {},
          editPassenger: function() {}
        })
      ]),

      m('.hl-separator'),
      m('.hl-list-group', [
        m(PassItem, {
          passenger: {
            psid: '2', // id号，供编辑和删除使用
            name: '徐小洋',
            type: 'CHD', // 'ADT'成人 'CHD':儿童
            idcard: '345',
            idtype: '0', // '0':身份证 '1':护照
            itn: '身份证',
            myself: '0', // '0': 他人，'1': 自己
            countrytype: 'domestic'
          },
          enableSelect: true,
          showSelectIcon: true,
          selectPassenger: function() {},
          editPassenger: function() {}
        })
      ]),

      m('.hl-separator'),
      m('.hl-list-group', [
        m(PassItem, {
          passenger: {
            psid: '3', // id号，供编辑和删除使用
            ename: 'XU/YANG',
            type: 'ADT', // 'ADT'成人 'CHD':儿童
            idcard: '345',
            idtype: '1', // '0':身份证 '1':护照
            itn: '护照',
            myself: '0', // '0': 他人，'1': 自己
            countrytype: 'international'
          },
          enableSelect: true,
          showSelectIcon: false,
          selectPassenger: function() {},
          editPassenger: function() {}
        })
      ])
    ]);
  }
});

const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');

require('./nameGuide.css');

const services = require('../../services');
const Header = require('components/header');

//---- Components -----
const NameForm = (surName, givenName) => m('.name-form-vertical.hl-list-group.hl-list-group-pb', [
  m('.hl-list-group-item',
    m('.hl-row', [
      m('.hl-col-3.hl-text-gray', '英文姓'),
      m('.hl-col-9', surName)
    ])
  ),
  m('.hl-list-group-item',
    m('.hl-row', [
      m('.hl-col-3.hl-text-gray', '英文名'),
      m('.hl-col-9', givenName)
    ])
  )
]);

module.exports = m.createComponent({
  title: '姓名填写指南',
  render(props, state) {
    return m('#passenger-nameGuide-page', [
      m(Header, { title: this.title }),

      m('.bg-transparent.hl-box-border-none', [
        m('ul.hl-text-sm.hl-text-gray', [
          m('li', '◎ 乘机人姓名必须与所使用证件保持一致'),
          m('li', '◎ 使用香港、台湾、澳门的护照不能乘坐国内航班'),
          m('li', '◎ 乘机人姓和名请务必按照登机证件上拼音或英文名填写')
        ]),

        m('.title.child-middle', [
          m('.icon-cn.hl-margin-right-sm'),
          m('span', '中文姓名填写')
        ]),

        m('ul.list-style-disk.hl-text-sm.hl-text-gray', [
          m('li', '使用护照登机，请确认护照上有中文名'),
          m('li', '姓名中有特殊符号，无需输入'),
          m('li', '姓名中间不要输入空格或其他符号')
        ]),

        m('.title.child-middle', [
          m('.icon-en.hl-margin-right-sm'),
          m('span', '英文姓名填写')
        ]),

        m('ul.list-style-disk.hl-text-sm.hl-text-gray', [
          m('li', '中文姓名“张小航”填写为：')
        ]),

        NameForm('ZHANG', 'XIAOHANG'),

        m('ul.list-style-disk.hl-text-sm.hl-text-gray', [
          m('li', '英文姓名：')
        ]),

        m('.hl-text-sm.hl-text-gray',
          '姓与名总长度小于等于26个字符，若过长请使用缩写。如Anastasia Elizabeth Luisanna Rodriguez缩写为：'),

        NameForm('RODRIGUEZ', 'A E L'),

        m('.hl-text-sm.hl-text-gray',
          'Middle name填写在Given name（英文名）栏，并填写在given name之后，以空格区分。如"Kevin Smith Wood"填写为：'),

        NameForm('WOOD', 'KEVIN SMITH'),

        m('.hl-text-sm.hl-text-gray',
          '姓名中含特殊符号时，在姓中不输入，名中用空格代替。如“jame.M-C Black.S-A”填写为：'),

        NameForm('BLACKSA', 'JAME M C'),

        m('figure', [
          m('figcaption', '新版护照图示：'),
          m('img', {
            src: '../images/user/passenger/passport-new.png'
          })
        ]),

        m('figure', [
          m('figcaption', '旧版护照图示：'),
          m('img', {
            src: '../images/user/passenger/passport-old.png'
          })
        ])
      ])
    ]);
  }
}, [injectCtrls({ user: services })]);

//

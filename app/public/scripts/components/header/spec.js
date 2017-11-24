var m = require('m-react');
var Header = require('components/header');
var i = 0;
var j = 0;
var k = 0;
var l = 0;
var n = 0;
var o = 0;
var level = 0;
module.exports = m.createComponent({
  title: '组件测试：Header',
  getInitialState() {
    return {
      title: '航班管家',
      show: 'extern',
      scrollToShow: false,
      tintColor: null,
      allowBack: true,
      headerRightBtn: null,
      statusBarPlaceholder: true,
      onHeaderBtnClick: () => console.log('click')
    };
  },
  render: function(props, state) {
    return m('.special-home', [
      m(Header, state),
      m('', {
        style: {
          background: 'gray',
          height: '400px'
        }
      }),

      m(
        'button',
        {
          onclick: () => {
            location.reload();
          }
        },
        'refresh'
      ),

      m(
        'button',
        {
          onclick: () => {
            level++;
            history.pushState({}, `当前页面:${level}`);
            this.setState();
          }
        },
        'pushState'
      ),

      m(
        'button',
        {
          onclick: () => {
            this.setState({
              show: ['extern', 'web', 'none'][j++ % 3]
            });
          }
        },
        'show:' + state.show
      ),

      m(
        'button',
        {
          onclick: () => this.setState({ title: ['高铁管家', '航班管家'][i++ % 2] })
        },
        'title:' + state.title
      ),

      m(
        'button',
        {
          onclick: () =>
            this.setState({
              tintColor: [[255, 0, 0, 1], null][j++ % 2]
            })
        },
        'tintColor:' + state.tintColor
      ),

      m(
        'button',
        {
          onclick: () =>
            this.setState({
              scrollToShow: [true, false][k++ % 2]
            })
        },
        'scrollToShow:' + state.scrollToShow
      ),

      m(
        'button',
        {
          onclick: () =>
            this.setState({
              headerCenterBtn: [m('', 'test btn'), null][o++ % 2]
            })
        },
        'headerCenterBtn:' + state.headerCenterBtn
      ),

      m(
        'button',
        {
          onclick: () =>
            this.setState({
              headerRightBtn: [Header.headerRightBtns.share, null][l++ % 2]
            })
        },
        'headerRightBtn:' + state.headerRightBtn
      ),

      m(
        'button',
        {
          onclick: () =>
            this.setState({
              statusBarPlaceholder: [false, true][n++ % 2]
            })
        },
        'statusBarPlaceholder:' + state.statusBarPlaceholder
      ),

      m('', [
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text'),
        m('', 'text')
      ])
    ]);
  }
});

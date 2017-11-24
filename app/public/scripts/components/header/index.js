/**
 * 导航栏
 * 接受属性根据native支持情况做了体验优化
 *
 * warning: complexity ahead
 */
const m = require('m-react');
const nativeApi = require('utils/nativeApi');
const throttle = require('../../utils/throttle');
const router = require('../../utils/simpleRouter');

require('./index.css');
require('css/flex.css');

const DEFAULT_COLOR = [74, 140, 224, 1];

let IS_NATIVE = window.__headless;
let IS_WECHAT = /MicroMessenger/i.test(navigator.userAgent);
let NATIVE_SUPPORT_INVISIBLE = true;
let NATIVE_SUPPORT_SCROLL_TO_SHOW = true;

nativeApi
  .isAvail()
  .then(avail => {
    IS_NATIVE = avail;

    return Promise.all([
      nativeApi
        .invoke('isSupported', { method: 'setNavigationBarVisible' })
        .then(({ value: isSupported }) => {
          NATIVE_SUPPORT_INVISIBLE = isSupported == '1';
        }),
      Promise.all([
        nativeApi.invoke('isSupported', { method: 'configNavigationBar' }),
        nativeApi.invoke('isSupported', { method: 'ConfigNavigationBar' })
      ]).then(([{ value: support1 }, { value: support2 }]) => {
        NATIVE_SUPPORT_SCROLL_TO_SHOW = support1 == '1' || support2 == '1';
      })
    ]);
  })
  .then(() => m.redraw());

const nativeBack = () =>
  nativeApi.isAvail().then(avail => {
    if (avail && !router.get(-1)) {
      nativeApi.invoke('close');
    }
    history.back();
  });

module.exports = m.createComponent({
  defaultProps: {
    title: '航班管家',
    tintColor: null, // [r,g,b,a] 导航栏颜色，支持native, null为默认色
    show: 'extern', // extern=优先显示native/wechat导航栏，web=优先显示web导航栏(微信内依然不显示)
    scrollToShow: false, // 导航栏是透明的，不占高度，回退按钮为白色。随页面上滑而显示导航栏，应该支持native
    scrollToShowDistance: 200, // 滑到多少像素时导航栏全显
    useStatusPlaceholder: false, // 在全屏模式下(web+scrollToShow) 是否显示系统状态栏占位

    allowBack: true, // 显示后退按钮. 注意：web版的后退按钮无法像native一样在没有历史时关闭webview, 需自己调用nativeAPI关闭
    onBack: nativeBack,

    headerRightBtn: null, // 右边的按钮 object:{ vnode:VNode, text:String, icon:String(base64) }  vnode||text用于web导航栏， icon||text用于native导航栏
    onHeaderRightBtnClick: error
  },

  getInitialState() {
    return {
      scrollTop: 0
    };
  },

  _onScroll: null,
  componentDidMount() {
    const scrollElem = document.scrollingElement || document.body;
    this._onScroll = throttle(() => {
      this.setState({ scrollTop: scrollElem.scrollTop });
    }, 300);
    window.addEventListener('scroll', this._onScroll);
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', this._onScroll);
  },

  render: function(
    {
      title,
      tintColor,
      show,
      scrollToShow,
      scrollToShowDistance,
      useStatusPlaceholder,

      allowBack,
      onBack,

      headerRightBtn,
      onHeaderRightBtnClick
    },
    { scrollTop }
  ) {
    const showWebHeader =
      (show === 'extern' && !(IS_NATIVE || IS_WECHAT)) ||
      (show === 'web' &&
        !(IS_NATIVE && !NATIVE_SUPPORT_INVISIBLE) &&
        !IS_WECHAT);

    const showWebHeaderBar = !scrollToShow || scrollTop > scrollToShowDistance;

    const isFullScreen =
      IS_NATIVE &&
      ((show === 'web' && NATIVE_SUPPORT_INVISIBLE) ||
        (scrollToShow && NATIVE_SUPPORT_SCROLL_TO_SHOW));

    const bgColorWeb = `rgba(${(tintColor || DEFAULT_COLOR).join(',')})`;
    const bgColorNative = (tintColor || DEFAULT_COLOR).join(',');

    document.title = this.props.title;
    return m('.header', [
      IS_NATIVE &&
        NativeNav({
          on: {
            headerRightBtnClick: onHeaderRightBtnClick
          },

          updateTitle: { text: title },

          setNavigationBarVisible: {
            value: show === 'extern' ? '1' : '0'
          },

          updateHeaderRightBtn: headerRightBtn
            ? {
                action: 'show',
                icon: headerRightBtn.icon,
                text: headerRightBtn.text
              }
            : {
                action: 'hide'
              },
          setNavigationBarTintColor: bgColorNative
            ? { tintColor: bgColorNative }
            : null,

          configNavigationBar: {
            navibarEnableAlphaGradient: scrollToShow ? '1' : '0',
            naviBarMinAlphaOffset: String(0),
            naviBarMaxAlphaOffset: scrollToShowDistance
          },

          // hbgj v6.5 iOS typo
          ConfigNavigationBar: {
            navibarEnableAlphaGradient: scrollToShow ? '1' : '0',
            naviBarMinAlphaOffset: String(0),
            naviBarMaxAlphaOffset: scrollToShowDistance
          }
        }),
      showWebHeader && [
        // 为网页内容提供占位
        m('', [
          isFullScreen &&
            useStatusPlaceholder &&
            m('.status-placeholder', {
              style: {
                'background-color': bgColorWeb
              }
            }),
          scrollToShow ? null : m('.nav-placeholder')
        ]),

        // 固顶的纯色背景 (可收缩到上面)
        m(
          '.header-bar',
          {
            style: {
              'background-color': bgColorWeb,
              transform: `translateY(${showWebHeaderBar ? 0 : '-100%'})`,
              webkitTransform: `translate3d(0, ${showWebHeaderBar
                ? 0
                : '-100%'}, 0)`,
              'pointer-events': 'none'
            }
          },
          [
            isFullScreen &&
              m('.status-placeholder', {
                style: {
                  'background-color': bgColorWeb
                }
              }),
            m(
              '.title.fx-center',
              title.length > 12 ? title.substr(0, 12) + '...' : title
            )
          ]
        ),

        // 固顶的控件
        m('.header-controls.fx-center' + (isFullScreen ? '.fullscreen' : ''), [
          allowBack &&
            m('.left.fx-center', { onclick: onBack }, m('.icon-back')),

          headerRightBtn &&
            m(
              '.right.fx-center',
              { onclick: onHeaderRightBtnClick },
              headerRightBtn.vnode || headerRightBtn.text
            )
        ])
      ]
    ]);
  }
});

module.exports.headerRightBtns = {
  share: IS_NATIVE
    ? {
        vnode: m('img', {
          style: {
            width: '20px'
          },
          src:
            'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjZweCIgaGVpZ2h0PSIyNnB4IiB2aWV3Qm94PSIwIDAgMjYgMjYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQyICgzNjc4MSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+cGF0aC0xPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPHBhdGggZD0iTTEyLDE3IEwxMi4yNzc3ODA5LDExLjk5OTk0MzMgQzEyLjQwMDUwOTEsOS43OTA4MzU2MiAxNS4yODExODE5LDcgMTcuNDk5NTUzMSw3IEwyNCw3IiBpZD0iUmVjdGFuZ2xlLTEyLUNvcHkiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CiAgICAgICAgPHBvbHlsaW5lIGlkPSJMaW5lLUNvcHkiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMC4yNDI2NDEsIDcuMjQyNjQxKSByb3RhdGUoNDUuMDAwMDAwKSB0cmFuc2xhdGUoLTIwLjI0MjY0MSwgLTcuMjQyNjQxKSAiIHBvaW50cz0iMTcuMjQyNjQwNyA0LjI0MjY0MDY5IDIyLjcyNzkyMjEgNC40MTQyMTM1NyAyMy4yNDI2NDA3IDEwLjI0MjY0MDciPjwvcG9seWxpbmU+CiAgICAgICAgPHBhdGggZD0iTTI0LDEyLjk3ODk1OTMgTDI0LDIwLjAwNTU2ODkgQzI0LDIxLjY2MDQwNiAyMi42NjIzNjQsMjMgMjEuMDA5OTQ3LDIzIEw0Ljk5MDA1MzAxLDIzIEMzLjM0MTc3ODczLDIzIDIsMjEuNjUwNDUxNSAyLDE5Ljk5MDQ0MjEgTDIsNi4wMDk1NTc5MSBDMiw0LjM0Njg1MTc2IDMuMzQ2NDM2MzgsMyA1LjAwOTMyOTM3LDMgTDE0LDMgTDE0LDEgTDUuMDA5MzI5MzcsMSBDMi4yNDE3Mjg3NiwxIDAsMy4yNDI0MjAzMyAwLDYuMDA5NTU3OTEgTDAsMTkuOTkwNDQyMSBDMCwyMi43NTI0NDQyIDIuMjM0NjE1OTEsMjUgNC45OTAwNTMwMSwyNSBMMjEuMDA5OTQ3LDI1IEMyMy43Njc1ODksMjUgMjYsMjIuNzY0MzIxMSAyNiwyMC4wMDU1Njg5IEwyNiwxMi45Nzg5NTkzIEwyNCwxMi45Nzg5NTkzIFoiIGlkPSJwYXRoLTEiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgPC9nPgo8L3N2Zz4='
        }),
        text: '分享'
      }
    : null
};

function NativeNav(options) {
  for (var method in options) {
    if (options.hasOwnProperty(method)) {
      var params = options[method];

      if (method === 'on') {
        for (var evt in params) {
          if (params.hasOwnProperty(evt)) {
            var handler = params[evt];
            nativeApi.on(evt, handler);
          }
        }
      } else {
        nativeApi.invokeIfChanged(method, params).catch(error);
      }
    }
  }
  return m('');
}

function error(e) {
  console.warn('[header]', e);
}

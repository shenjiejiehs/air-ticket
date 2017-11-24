const m = require('m-react');
const Promise = require('utils/promise');

require('./index.css');
require('css/flex.css');

let container = null;
let hasRendered = false;

const noop = e => {};

const Popup = (
  {
    title = '管家提示',
    content = '好像出了点问题，请稍后再试',
    buttons = [{ key: 'confirm', text: '确定' }],
    onSelect = e => console.log(e)
  } = {}
) =>
  m(
    '.popup.fx-center',
    m('.wrapper.fx-col', [
      m('.title.hl-text-lg', title),
      m('.content.hl-text-md', content),
      m(
        '.btn-group.fx-s-stretch.fx-row.hl-text-md',
        buttons.map(button =>
          m(
            '.btn.fx-1.fx-center' +
              (button.text.length > 5 ? '.hl-text-xs' : ''),
            { evClick: () => onSelect(button.key), evTouchStart: noop },
            button.text
          ))
      )
    ])
  );

/**
 * 显示一个弹框！
 *
 * @param title string, 标题，默认'管家提示'
 * @param content string/vdom, 内容, 不传就报错！
 * @param buttons array{key:string,text:string} 按钮
 * @return Promise{key:string} 会以用户按下按钮的key为结果
 */
function show(option) {
  hasRendered = true;
  setTimeout(
    function() {
      getContainer().classList.add('active');
    },
    0
  );
  return new Promise(resolve => {
    option.onSelect = button => {
      resolve(button);
      hide();
    };
    m.render(getContainer(), Popup(option), false, true);
  });
}

/**
 * 隐藏之
 */
function hide() {
  getContainer().classList.remove('active');
}

/**
 * 显示一个特殊弹框: Alert
 *
 * @param content string/vdom, 内容, 不传就报错！
 * @return Promise 用户点了确认时resolve
 */
function alert(content) {
  return show({ content });
}

/**
 * 显示一个特殊弹框: Confirm
 *
 * @param content string/vdom, 内容, 不传就报错！
 * @return Promise{boolean} resolve用户是否确认
 */
function confirm(content, { buttons } = {}) {
  return show({
    content,
    buttons: buttons || [
      { key: 'cancel', text: '取消' },
      { key: 'confirm', text: '确认' }
    ]
  }).then(key => key == 'confirm');
}

function getContainer() {
  container = container || document.getElementById('popup-container');
  if (!container) {
    container = document.createElement('DIV');
    container.id = 'popup-container';
    document.body.appendChild(container);
  }
  return container;
}

/** 预渲染一次生成DOM，提高后续弹框的启动速度 */
setTimeout(
  function() {
    if (!hasRendered) {
      hasRendered = true;
      m.render(getContainer(), Popup({}), false, true);
    }
  },
  500
);

module.exports = { show, hide, alert, confirm };

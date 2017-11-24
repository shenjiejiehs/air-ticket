/**
 * 卡片
 */
const m = require('m-react');
require('./index.css');
require('css/flex.css');

module.exports = function({
  title, // null|string|vnode, 卡片标题
  content, // null|string|vnode, 卡片内容
  padding = true, // boolean, 是否有padding
  shadow = false, // boolean, 是否有阴影
  hole = false, // boolean, 是否有孔
  divider = 'dashed' // dashed|solid|none, 分割线样式
} = {}) {
  return m('.card' + (shadow ? '.shadow' : '') + (hole ? '.hole' : '') + (padding ? '.padding' : ''), [
    title != null && m('.title', title),
    title != null && content != null && m('.divider.fx-row', [
      m('.circle.left'),
      m(`.line.${divider}.fx-1`),
      m('.circle.right')
    ]),
    content != null && m('.content', content)
  ]);
};

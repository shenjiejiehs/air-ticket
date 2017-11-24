/**
 * 包含列表的卡片
 */
const m = require('m-react');
const Card = require('components/card');


require('./index.css');
require('css/flex.css');

module.exports = function({
  shadow = true,
  list = []
} = {}) {
  return Card({
    shadow,
    padding: false,
    content: m('.list-card', list.map(item =>
      m('.item', item)
    ))
  });
};

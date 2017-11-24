/**
 * 为payload加上自定义参数
 */

const addParam = toAdd => payload =>
  Object.assign({}, typeof toAdd === 'function' ? toAdd(payload) : toAdd, payload);

module.exports = addParam;

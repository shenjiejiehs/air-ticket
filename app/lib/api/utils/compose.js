/**
 * 按从右到左的顺序对param应用queue中的functions，返回promise
 */
module.exports = (...fns) => arg =>
  fns.reverse().reduce((prev, cur) => cur(prev), arg);

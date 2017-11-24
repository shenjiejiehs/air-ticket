/**
 * 按从左到右的顺序对param应用queue中的functions，返回promise
 */
module.exports = queue => param =>
  queue.reduce((prev, cur) => prev.then(cur), Promise.resolve(param));

const Promise = require('utils/promise');

const delay = delayInMs => new Promise(res => setTimeout(res, delayInMs));

const takeAttempt = (fn, param, attempt, interval) =>
  Promise.resolve(param).then(fn).catch(e => {
    if (attempt > 0) {
      return delay(interval)
        .then(() => takeAttempt(fn, param, attempt - 1, interval));
    } else {
      throw e;
    }
  });

/**
 * 为函数增加重试的行为
 *
 * @example see below
 */
const retry = ({ attempt = 3, interval = 1000 } = {}) => fn => param =>
  takeAttempt(fn, param, attempt - 1, interval);

module.exports = retry;


// Example
//
// const myFailFn = () => {
//   console.log(1);
//   return Promise.reject();
// }
// const myFailFnWith3Retry = retry()(myFailFn)

// myFailFn() // 1, reject
// myFailFnWith3Retry() // 1 1 1, reject

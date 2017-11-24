const Loading = require('components/loading');
const logger = require('utils/logger');
const Promise = require('utils/promise');

module.exports = {
  log: (name = '') => fn =>
    (/(dev|test)/.test(window.__env__)
      ? arg => {
          return fn(arg).then(
            result => {
              return result;
            },
            error => {
              logger.error(error, '[api] ' + name + ' error');
              console.error(error);
              throw error;
            }
          );
        }
      : fn),

  loading: msg => fn => arg => {
    Loading.show(msg || null);
    return fn(arg).then(
      result => {
        Loading.hide();
        return result;
      },
      error => {
        Loading.hide();
        throw error;
      }
    );
  },

  pick: () => fn => arg => {
    return fn(arg).then(res => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then(parsed => {
          throw parsed;
        });
      }
    });
  },

  // 返回假数据, 支持成功和失败分支
  fake: (succ, err = {}) => fn => arg =>
    new Promise((resolve, reject) =>
      setTimeout(
        () => resolve(typeof succ == 'function' ? succ(arg) : succ),
        100
      )
    )
};

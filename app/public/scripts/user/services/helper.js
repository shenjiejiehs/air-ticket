const Loading = require('components/loading');
const Popup = require('components/popup');
const logger = require('utils/logger');
const Promise = require('utils/promise');

module.exports = {
  log: (name = '') => fn => arg => {
    logger.info(arg, '[api] ' + name + ' start');
    return fn(arg)
      .then(
        result => {
          logger.info(result, '[api] ' + name + ' success');
          return result;
        },
        error => {
          logger.error(error, '[api] ' + name + ' error');
          throw error;
        }
      );
  },

  loading: msg => fn => arg => {
    Loading.show(msg || null);
    return fn(arg)
      .then(
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

  catchError: handler => (...args) => {
    try {
      let result = handler(...args);
      if (result && typeof result.then == 'function') {
        return result.catch(defaultErrorHandler);
      } else {
        return result;
      }
    } catch (e) {
      return defaultErrorHandler(e);
    }
  },

  // 返回假数据, 支持成功和失败分支
  fake: (succ, err = {}) => fn => arg =>
    new Promise((resolve, reject) =>
      setTimeout(() => resolve(typeof succ == 'function' ? succ(arg) : succ), 100)
    ),

  // 在url上获取query string
  getQueryStringValue: key =>
    decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"))
};

function defaultErrorHandler(err = {}) {
  console.error(err);
  if (!err.isSilent) {
    // logger.error(err, '[defaultErrorHandler]');
    Popup.confirm(err.error && err.error.msg || '和服务器通信失败，请稍后重试')
      .then(() => {
        if (err.isFatal) {
          history.back();
        }
      });
  }
}

/**
 * NativeAPI
 * 用于 JavaScript 与 Native 双向通信。
 * 文档：https://www.zybuluo.com/tianfangye/note/167761
 *
 */

const Promise = require('utils/promise');
const retry = require('./retry');
const isEqual = require('./isEqual');

const nativeToJsPool = {
  back: params => ({ preventDefault: false })
};
const jsToNativePool = (function createPool() {
  const pool = {};

  // 订阅native的响应结果
  const subscribe = id =>
    new Promise((resolve, reject) => {
      pool[id] = (pool[id] || []).concat({ resolve, reject });
    });

  // native发回带id的响应
  const echo = response => {
    const { result, error, id } = response || {};
    (pool[id] || [])
      .forEach(
        ({ resolve, reject }) => (error ? reject(error) : resolve(result))
      );
    delete pool[id];
  };

  return { subscribe, echo };
})();

/**
 * 实际调用NativeAPI, 发送jsonrpc请求
 * http://www.jsonrpc.org/specification
 */
function invokeNativeAPI(method, params) {
  const id = Math.floor(Math.random() * 100000);
  setTimeout(function() {
    window.NativeAPI.sendToNative(
      JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id
      })
    );
  }, 0);
  return jsToNativePool.subscribe(id);
}

/**
 * Native发给JS的事件通知
 */
function invokeJSAPI(method, params, id) {
  if (nativeToJsPool[method]) {
    Promise.resolve(params).then(nativeToJsPool[method]).then(result => {
      if (id && result) {
        window.NativeAPI.sendToNative(
          JSON.stringify({
            jsonrpc: '2.0',
            result,
            id
          })
        );
      }
    });
  }
}

function checkSupport(method, params) {
  return invokeNativeAPI('isSupported', { method }).then(({
    value: isSupported
  }) => {
    if (isSupported != '1') {
      throw {
        msg: '当前客户端版本过低, 无法进行该操作',
        code: 'method_not_supported',
        method,
        params
      };
    }
  });
}

const preparePromise = (function prepare() {
  function detectNativeAPI() {
    if (!(window.NativeAPI && window.NativeAPI.sendToNative)) {
      throw { msg: '该操作需要在客户端内进行', code: 'native_api_not_found' };
    }
  }

  function registerJSAPI() {
    window.NativeAPI.sendToJavaScript = message => {
      message = JSON.parse(message);
      if (message.method) {
        // 是发给JS的请求
        return invokeJSAPI(message.method, message.params, message.id);
      } else {
        // 是返回JS的响应
        return jsToNativePool.echo(message);
      }
    };
  }

  return retry({ attempt: 3, interval: 300 })(detectNativeAPI)()
    .then(registerJSAPI)
    .then(() => console.info('[native api] ready'));
})();

// 监听Native发来的事件，当前支持method:
// - resume，从别的webview返回
// - back, 顶栏back被点击
// - headerRightBtnClick - 顶栏右侧按钮被点击
// 注意：会替换掉前一个callback
module.exports.on = (method, callback) => {
  nativeToJsPool[method] = callback;
};

// 仅检测NativeAPI支持情况
// 返回Promise<Boolean>
module.exports.isAvail = () => preparePromise.then(() => true, () => false);

// 调用NativeAPI，返回Promise
// （如果不支持，将reject）
module.exports.invoke = (method, params) =>
  preparePromise
    .then(() => checkSupport(method, params))
    .then(() => invokeNativeAPI(method, params));

// 和上面的区别是会记录请求参数，如果上一次用某组参数请求成功则不会重新请求
module.exports.invokeIfChanged = memorize(module.exports.invoke);

function memorize(invoke) {
  let cache = {};

  return (method, param) => {
    const cached = cache[method] || {};
    if (isEqual(cached.param, param)) {
      if (cached.error) return Promise.reject(cached.error);
      return Promise.resolve(cached.result);
    } else {
      return invoke(method, param).then(
        result => {
          cache[method] = { param, result };
          return result;
        },
        error => {
          cache[method] = { param, error };
          throw error;
        }
      );
    }
  };
}

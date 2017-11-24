module.exports = {
  localStorage: storageAvailable('localStorage')
    ? {
        load(key) {
          let str = localStorage.getItem(key);
          return str && JSON.parse(str);
        },
        save(key, obj) {
          localStorage.setItem(key, JSON.stringify(obj));
        }
      }
    : { load: noop, save: noop },

  sessionStorage: storageAvailable('sessionStorage')
    ? {
        load(key) {
          let str = sessionStorage.getItem(key);
          return str && JSON.parse(str);
        },
        save(key, obj) {
          sessionStorage.setItem(key, JSON.stringify(obj));
        }
      }
    : { load: noop, save: noop }
};

function storageAvailable(type) {
  try {
    var storage = window[type], x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

function noop() {}

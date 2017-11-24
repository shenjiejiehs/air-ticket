// short version of https://github.com/marcuswestin/store.js,
// only support modern browsers (Firefox 4.0+, Chrome 11+, IE9+, iOS 4+)
var win = window;
var store = {},
  localStorageName = 'localStorage',
  storage,
  __memStorage__ = {};

store.disabled = false;

store.serialize = function(value) {
  return JSON.stringify(value);
};
store.deserialize = function(value) {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};
store.set = store.get = store.remove = store.clear = store.getAll = store.forEach = store.validateVersion = function() {};
// Functions to encapsulate questionable FireFox 3.6.13 behavior
// when about.config::dom.storage.enabled === false
// See https://github.com/marcuswestin/store.js/issues#issue/13

function isLocalStorageNameSupported() {
  try {
    return (localStorageName in win && win[localStorageName]);
  } catch (err) {
    return false;
  }
}

if (isLocalStorageNameSupported()) {
  store.supported = true;
  storage = win[localStorageName];
  store.set = function(key, val) {
    if (val === undefined) {
      return store.remove(key);
    }
    try {
      storage.setItem(key, store.serialize(val));
    } catch (err) {
      console.log(err);
      __memStorage__[key] = val;
    }
    return val;
  };
  store.get = function(key) {
    try {
      return store.deserialize(storage.getItem(key));
    } catch (err) {
      console.log(err);
      return __memStorage__[key];
    }

  };
  store.remove = function(key) {
    try {
      storage.removeItem(key);
    } catch (err) {
      console.log(err);
      delete __memStorage__[key];
    }

  };
  store.clear = function() {
    try {
      storage.clear();
    } catch (err) {
      console.log(err);
      __memStorage__ = {};
    }

  };
  store.getAll = function() {
    var ret = {};
    store.forEach(function(key, val) {
      ret[key] = val;
    });
    return ret;
  };
  store.forEach = function(callback) {
    for (var i = 0; i < storage.length; i++) {
      var key = storage.key(i);
      callback(key, store.get(key));
    }
  };

  store.validateVersion = function(ver, prefix){
    var verKey = prefix+'_VERSION';
    var prevVer = this.get(verKey);
    if(ver != prevVer){
      //clear old data
      Object.keys(storage).forEach(function(key){
        if(key.indexOf(prefix) === 0){
          store.remove(key);
        }
      });
    }
    store.set(verKey, ver);
  };
  try {
    var testKey = '__storejs__';
    store.set(testKey, testKey);
    if (store.get(testKey) != testKey) {
      store.disabled = true;
    }
    store.remove(testKey);
  } catch (e) {
    store.disabled = true;
  }
  store.enabled = !store.disabled;
} else {
  store.supported = false;
  store.enabled = false;
}


module.exports = store;

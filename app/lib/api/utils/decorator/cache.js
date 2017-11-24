module.exports = () => service => {
  let cache = Cache();

  return options => {
    const key = toKey(options);
    if (cache.get(key) != null) {
      return Promise.resolve(cache.get(key));
    } else {
      return service(options).then(result => (cache.set(key, result), result));
    }
  };
};

function toKey(obj) {
  return JSON.stringify(obj); // naive key generate, cannot guarantee get same keys from same objects
}

function Cache() {
  if (this instanceof Cache) {
    return Cache();
  }
  let cache = {};

  setInterval(removeObsolete, 1000);

  return { get, set };

  function set(key, value, ttl = 1000 * 60 * 10) {
    cache[key] = { value, expiresAt: new Date().valueOf() + ttl };
  }

  function get(key) {
    const hit = cache[key];
    return hit && hit.value;
  }

  function removeObsolete() {
    const now = new Date().valueOf();
    for (var key in cache) {
      if (cache.hasOwnProperty(key)) {
        if (cache[key] != null && now > cache[key].expiresAt) {
          cache[key] = null;
        }
      }
    }
  }
}

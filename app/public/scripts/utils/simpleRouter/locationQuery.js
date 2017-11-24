const router = require('../simpleRouter');
const m = require('m-react');

const Empty = m(
  '',
  {
    style: {
      display: 'none !important'
    }
  },
  null
);

let cachedKey;
let cachedResult;
const memoize = fn => params => {
  const key = JSON.stringify(params);
  if (key === cachedKey) {
    return cachedResult;
  } else {
    cachedResult = fn(params);
    cachedKey = key;
    return cachedResult;
  }
};

module.exports = memoize(query => {
  router.updateQuery(query);
  return Empty;
});

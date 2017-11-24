const type = require('common/type');
const mapObject = (fn, object) => {
  let newObj = {};
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      newObj[key] = fn(object[key], key);
    }
  }
  return newObj;
};

const map = (fn, target) => {
  switch (type(target)) {
    case 'object':
      return mapObject(fn, target);
    case 'array':
      return target.map(fn);
    default:
      throw new Error('target not mappable', target);
  }
};

const curried = (fn, target) =>
  typeof target === 'undefined' ? target => map(fn, target) : map(fn, target);

module.exports = curried;
// const curry = fn => {
//   const curried = cache => (...args) => {
//     const received = cache.concat(args);
//     if (received.length >= fn.length) {
//       return fn(...received);
//     } else {
//       return curried(received);
//     }
//   };
//   return curried([]);
// };

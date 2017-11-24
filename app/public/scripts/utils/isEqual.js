const type = require('./type');

// warn: Symbol, NaN, TypedArray etc. are not properly handled, false is returned
module.exports = function isEqual(a, b) {
  if (a === b) return true; // number, string, reference
  if (a == null && b == null) return true; // null, undefined
  const typeA = type(a);
  const typeB = type(b);

  if (typeA === typeB) {
    switch (typeA) {
      case 'array':
        return a.length === b.lenth && a.every((_, i) => isEqual(a[i], b[i]));
      case 'object':
        return Object.keys(a).length === Object.keys(b).length &&
          Object.keys(a).every(key => isEqual(a[key], b[key]));
      case 'regexp':
        return a.toString() === b.toString();
      default:
        break;
    }
  }
  return false;
};

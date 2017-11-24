/* jshint -W138 */

/**
 * Utils:
 */

//  error constructor
const error = (path = [], expected, received, message) =>
  ({
    path,
    expected,
    received,
    message: message || `Path:'${path.join('.')}', Expected: ${expected}, Received: '${JSON.stringify(received)}'`
  });

// get primitive type
const type = val => {
  if (val !== val) {
    return 'NaN';
  }
  const typeMatch = Object.prototype.toString.call(val).match(/^\[object (\w+)\]$/);
  return typeMatch == null ? 'unknown' : typeMatch[1].toLowerCase();
};

// dedupe an array
const dedupe = arr => arr.filter((val, i) => arr.indexOf(val) === i);

const deepEqual = (a, b) => (
  (a === b) ||
  JSON.stringify(a) === JSON.stringify(b) ||
  (
    typeof a === 'object' &&
    typeof b === 'object' &&
    dedupe([...Object.keys(a), ...Object.keys(b)])
    .every(key => deepEqual(a[key], b[key]))
  )
);

const nullOrUndefined = (s, path) => s == null ? null : error(path, 'null or undefined', s);


/**
 * Logical Operators
 */
const not = v =>
  (s, path) => v(s) ? null : error(path, `not(${v.name})`, s);

const any =
  (s, path) => null;

const and = (...vs) =>
  (s, path) => {
    for (const v of vs) {
      const err = v(s, path);
      if (err) return err;
    }
    return null;
  };

const or = (...vs) =>
  (s, path) => {
    let errs = [];
    for (const v of vs) {
      const err = v(s, path);
      if (!err) {
        return null;
      } else {
        errs.push(err);
      }
    }
    return error(path, `or(${errs.map(e => e.expected).join(', ')})`, s);
  };

const optional = v =>
  or(nullOrUndefined, v);


// strictly/deeply equal
const is = value =>
  (s, path) => deepEqual(s, value) ? null : error(path, `is(${JSON.stringify(value)})`, s);

const oneOf = (...refs) =>
  or(...refs.map(ref => is(ref)));



/**
 * Basic Type Validators
 */
const string = (s, path) => type(s) === 'string' ? null : error(path, 'string', s);
const number = (s, path) => type(s) === 'number' ? null : error(path, 'number', s);
const boolean = (s, path) => type(s) === 'boolean' ? null : error(path, 'boolean', s);
const object = (s, path) => type(s) === 'object' ? null : error(path, 'object', s);
const array = (s, path) => type(s) === 'array' ? null : error(path, 'array', s);
const date = (s, path) => type(s) === 'date' ? null : error(path, 'date', s);
const regexp = (s, path) => type(s) === 'regexp' ? null : error(path, 'regexp', s);
const Null = (s, path) => type(s) === 'null' ? null : error(path, 'null', s);
const Undefined = (s, path) => type(s) === 'undefined' ? null : error(path, 'undefined', s);
const empty = nullOrUndefined;


/**
 * Composite Type Validators
 */
const objectOf = objSchema =>
  and(
    object,
    ...Object.keys(objSchema).map(key =>
      ((s, path = []) => objSchema[key](s[key], path.concat(key)))
    )
  );

const arrayOf = v =>
  (ss, path = []) => {
    let err = (array(ss, path));
    if (err) return err;
    for (let i = 0; i < ss.length; i++) {
      err = v(ss[i], path.concat(i));
      if (err) return err;
    }
    return null;
  };

const jsonString = v =>
  (s, path = []) => {
    let parsed;
    try {
      parsed = JSON.parse(s);
    } catch (e) {
      return error(path, 'JSON string', s);
    }
    return v(parsed, path);
  };

const numeric = (s, path = []) =>
  isNaN(Number(s)) ? error(path, 'numeric', s) : null;


const toObjSchema = ref => {
  switch (type(ref)) {
    case 'function':
      return ref; // I'm a special flake
    case 'number':
      return number;
    case 'string':
      return string;
    case 'boolean':
      return boolean;
    case 'date':
      return date;
    case 'regexp':
      return regexp;
    case 'null':
      return empty;
    case 'undefined':
      return empty;
    case 'object':
      return objectOf(
        Object.keys(ref).reduce((schema, key) => {
          schema[key] = toObjSchema(ref[key]);
          return schema;
        }, {})
      );
    case 'array':
      return ref[0] == null ? array : arrayOf(toObjSchema(ref[0]));
    default:
      return is(ref);
  }
};
const like = toObjSchema;

/**
 * Other Commonly Used Validators
 */
const regex = re =>
  (s, path) => re.test(s) ? null : error(path, `match regex(${re})`, s);


module.exports = {
  error,

  object,
  array,
  string,
  number,
  boolean,
  date,
  regexp,
  Null,
  Undefined,
  empty,
  regex,

  not,
  any,
  and,
  or,
  optional,
  is,
  oneOf,
  like,

  objectOf,
  arrayOf,
  jsonString,
  numeric
};

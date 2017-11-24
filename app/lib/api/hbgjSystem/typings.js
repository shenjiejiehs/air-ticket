const {
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
} = require('../utils/validator');

module.exports = {
  user: {
    authcode: { Param: objectOf({ userid: numeric }) },
    infoByCode: {
      Param: objectOf({ authcode: string, sid: string }),
      Result: objectOf({ user: optional(object), card: optional(object) })
    },
    pinyin: {
      Param: objectOf({ name: string }),
      Result: objectOf({ pinyin: array })
    }
  },
  gift: {
    order: {
      query: { Param: objectOf({ orderid: string }), Result: any }
    }
  },
  airport: {
    nearby: {
      Param: objectOf({
        geolat: numeric,
        geolon: numeric,
        range: optional(numeric)
      }),
      Result: objectOf({
        list: arrayOf(
          objectOf({
            code: string,
            geolat: numeric,
            geolon: numeric,
            distance: numeric
          })
        )
      })
    }
  }
};

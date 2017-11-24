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

const Banner = objectOf({
  icon_url: regex(/^http/),
  page_url: regex(/^http/),
  display_order: numeric
});

const Title = objectOf({
  name: string,
  type: oneOf(0, 1, '0', '1'),
  display_order: numeric,
  content: jsonString(arrayOf({}))
});

module.exports = {
  homePage: {
    Param: objectOf({
      uid: optional(string),
      from: optional(oneOf('special_gtgj', 'special_hbgj', 'special_weixin')),
      st: oneOf(0, '0'),
      org: optional(string)
    }),
    Result: objectOf({
      status: numeric,
      org: string,
      dst: string,
      month: string,
      cost: numeric,
      total: numeric,
      datas: jsonString(
        objectOf({
          bannner: arrayOf(Banner),
          title: arrayOf(Title)
        })
      )
    })
  }
};

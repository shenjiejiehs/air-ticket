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
  flight: {
    search: {
      '4312': {
        Param: objectOf({
          pid: numeric, //默认4312
          no: string, //航班号
          date: string, //飞行日期(yyyy-MM-dd)
          type: numeric, //0：默认搜索，1：客户端自动搜索
          sid: string //参与运算参数：uid,pid,date,no,systemtime
        }),
        Result: any // to do
      }
    }
  },
  user: {
    info: {
      '4134': {
        Param: objectOf({
          pid: is(4134),
          type: oneOf('passenger', 'contact', 'invoice'),
          contrytype: optional(string),
          sid: string
        }),
        Result: any // to do
      },
      '4135': {
        Param: objectOf({
          pid: is(4135),
          info: string,
          operation: oneOf('add', 'modify', 'delete'),
          type: oneOf('passenger', 'contact', 'invoice'),
          sid: string
        }),
        Result: any // to do
      }
    }
  }
};

/**
 * 用户身份获取、验证与绑定
 * http://gitlab.huolih5.com/web-service/user-identity/wikis/user-identity-api
 *
 * 请在添加接口时，和官方文档及API保持结构/顺序/命名一致
 *
 *             ******       ******
 *           **********   **********
 *         ************* *************
 *        *****************************
 *        *****************************
 *        *****************************
 *         ***************************
 *           ***********************
 *             *******************
 *               ***************
 *                 ***********
 *                   *******
 *       MAKE API      ***
 *       NOT WAR        *
 */

// 请求构造工具
const request = require('../utils/request');
const pipe = require('../utils/pipe');
const addCommon = require('../utils/transformer/addCommon');
const addParam = require('../utils/transformer/addParam');
const addAuthHeader = require('../utils/transformer/addAuthHeader');
const preCheck = require('../utils/transformer/preCheck');
const postCheck = require('../utils/transformer/postCheck');
const toRequestOption = require('../utils/transformer/toRequestOption');
const timeout = require('./../utils/decorator/timeout');
const pickResult = require('./pickResult');
const addSid = require('./addSid');
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

const env = process.env.ENV || 'dev';

const host = {
  prod: 'https://h5.133.cn',
  prod_meituan: 'https://h5.133.cn',
  test: 'https://wtest.133.cn',
  dev: 'https://wtest.133.cn'
}[env];

// 便利小助手
const createAPI = (
  { pid, path, method = 'GET', auth = false, sidField, preChecker, postChecker }
) =>
  pipe(
    [
      pid && addParam({ pid }),
      addCommon(),
      sidField && addSid(...sidField),
      preChecker && preCheck(preChecker),
      toRequestOption({ url: `${host}/users/api/${path}`, method }),
      auth && addAuthHeader(),
      timeout()(request),
      pickResult(),
      postChecker && postCheck(postChecker)
    ].filter(Boolean)
  );

/**
 * @param any options
 * @returns Promise result
 *   resolve with: Object {
 *      data,  // parse后的body
 *      options,  // 调用使用的options
 *      response,
 *      statusCode
 *   }
 *   reject with: Object {
 *      error,  // 描述错误信息的对象
 *      message, // 用于内部日志的错误信息
 *      msg,   // 用于提示给用户的错误信息
 *      options,  // 请求服务端的参数
 *      response,  // 服务端响应
 *      statusCode  // 准备用于返回前端的状态码，20X为请求成功(获得/修改了所需资源)，40X为客户端错误（请求参数不当/条件不满足等），50X为服务器错误
 *   }
 */
module.exports = {
  bindWeixin: createAPI({
    path: 'bindWeixin',
    method: 'POST',
    preChecker: objectOf({
      wxuserinfo: jsonString(
        objectOf({
          unionid: string,
          openid: string,
          nickname: string,
          sex: string
        })
      ),
      businesstype: numeric,
      phoneid: numeric
    })
  }),
  queryByWeixin: createAPI({
    path: 'queryByWeixin',
    // preChecker: objectOf({ phone: numeric, smsType: numeric })
    method: 'POST'
  }),
  sendLoginCode: createAPI({
    path: 'sendLoginCode',
    method: 'GET',
    preChecker: objectOf({ phone: numeric, smsType: numeric })
  }),
  verifyLoginCode: createAPI({
    path: 'verifyLoginCode',
    method: 'GET',
    preChecker: objectOf({ phone: numeric, code: numeric })
  })
};

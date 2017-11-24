/**
 * 航班管家客户端访问api
 *
 * http://gitlab.qtang.net/luolj/hbgj-api/blob/master/desc.md
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
const parseXml = require('../utils/transformer/parseXml');
const timeout = require('./../utils/decorator/timeout');
const cacheResult = require('../utils/decorator/cache.js');
const pickResult = require('./pickResult');
const addSid = require('./addSid');

// 类型描述
const typings = require('./typings');

const env = process.env.ENV || 'dev';

const host = {
  prod: 'http://jp.rsscc.com:80',
  prod_meituan: 'http://jp.rsscc.com:80',
  test: 'http://221.235.53.167:6080',
  dev: 'http://221.235.53.167:6080'
}[env];

// 便利小助手
const createAPI = ({
  pid,
  defaults = null,
  path,
  method = 'GET',
  auth = false,
  cache = false,
  sidField,
  preChecker,
  postChecker
}) => {
  let api = pipe(
    [
      pid && addParam({ pid }),
      defaults && addParam(defaults),
      addCommon(),
      sidField && addSid(...sidField),
      preChecker && preCheck(preChecker),
      toRequestOption({
        url: `${host}/v3/${path}`,
        method
      }),
      auth && addAuthHeader(),
      timeout()(request),
      parseXml(),
      pickResult(),
      postChecker && postCheck(postChecker)
    ].filter(Boolean)
  );

  if (cache) {
    api = cacheResult()(api);
  }

  return api;
};

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
  base: {
    data: {
      // 航班管家基础数据，如：航司数据，银行列表，证件类型列表等相关数据返回
      '4011': createAPI({
        pid: 4011,
        path: 'base/data',
        method: 'GET',
        auth: false,
        cache: true,
        sidField: ['uid', 'dver']
      }),
      // 国内机场数据以及国际机场数据更新，根据iver控制当前版本号。用户可以手动更新。
      // 城市三字码也包含在内
      '4012': createAPI({
        pid: 4012,
        defaults: { type: 'all', iver: '0.0' },
        path: 'base/data',
        method: 'GET',
        auth: false,
        cache: true,
        sidField: ['uid', 'iver', 'type']
      })
    }
  },
  user: {
    info: {
      '4134': createAPI({
        pid: 4134,
        path: 'user/info',
        method: 'GET',
        auth: true,
        sidField: ['uid', 'pid', 'type'],
        preChecker: typings.user.info['4134'].Param,
        postCheck: typings.user.info['4134'].Result
      }),
      '4135': createAPI({
        pid: 4135,
        path: 'user/info',
        method: 'POST',
        auth: true,
        sidField: ['uid', 'pid', 'info'],
        preChecker: typings.user.info['4135'].Param,
        postCheck: typings.user.info['4135'].Result
      })
    }
  },
  flight: {
    search: {
      '4312': createAPI({
        pid: 4312,
        path: 'flight/search',
        method: 'GET',
        auth: true,
        sidField: ['uid', 'pid', 'date', 'no', 'systemtime'],
        preChecker: typings.flight.search['4312'].Param,
        postCheck: typings.flight.search['4312'].Result
      })
    }
  }
};

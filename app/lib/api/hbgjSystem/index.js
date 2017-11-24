/**
 * 航班管家对内部服务器api
 *
 * http://gitlab.qtang.net/luolj/hbgj-system-api/blob/master/%E7%9B%AE%E5%BD%95.md
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
const preCheck = require('../utils/transformer/preCheck');
const postCheck = require('../utils/transformer/postCheck');
const toRequestOption = require('../utils/transformer/toRequestOption');
const timeout = require('./../utils/decorator/timeout');
const pickResult = require('./pickResult');
const addSid = require('./addSid');

// 类型描述
const typings = require('./typings');

const env = process.env.ENV || 'dev';

const host = ({
  prod: 'http://innerapi.hbgj.huoli.local',
  prod_meituan: 'http://innerapi.hbgj.huoli.local',
  test: 'http://221.235.53.167:6080',
  dev: 'http://221.235.53.167:6080'
})[env];

// 便利小助手
const createAPI = (
  { path, method = 'GET', sidField, preChecker, postChecker }
) =>
  pipe(
    [
      addCommon({ system: 'hangban-web' }),
      sidField && addSid(...sidField),
      preChecker && preCheck(preChecker),
      toRequestOption({ url: `${host}/v3/external/${path}`, method }),
      timeout()(request),
      pickResult(),
      postChecker && postCheck(postChecker)
    ].filter(Boolean)
  );

module.exports = {
  // 3.5 用户信息接口
  user: {
    // 3.5.5 根据会员id获取登录令牌
    authcode: createAPI({
      path: 'user/authcode',
      preChecker: typings.user.authcode.Param
    }),
    // 3.5.7 根据身份令牌获取用户信息
    infoByCode: createAPI({
      path: 'user/infoByCode',
      sidField: ['authcode'],
      preChecker: typings.user.infoByCode.Param,
      postChecker: typings.user.infoByCode.Result
    }),
    // 3.5.16获取中文拼音
    pinyin: createAPI({
      path: 'user/pinyin',
      sidField: ['name'],
      preChecker: typings.user.pinyin.Param,
      postChecker: typings.user.pinyin.Result
    })
  },
  gift: {
    order: {
      // 3.6.3获取订单信息
      query: createAPI({
        path: 'gift/order/query',
        sidField: ['phoneid', 'orderid'],
        preChecker: typings.gift.order.query.Param,
        postChecker: typings.gift.order.query.Result
      })
    }
  },
  airport: {
    // 3.16.1
    nearby: createAPI({
      path: 'airport/nearby',
      sidField: ['geolat', 'geolon', 'range'],
      preChecker: typings.airport.nearby.Param,
      postChecker: typings.airport.nearby.Result
    })
  }
};

/**
 * 根据访问请求的Authorization Header, 获取用户信息，写入req.session.userInfo
 */

const Buffer = require('buffer').Buffer;
const userApi = require('./../lib/api/hbgjSystem').user;

const isDev = /^dev/i.test(process.env.NODE_ENV || 'dev');

module.exports = function(req, res, next) {
  const logger = req.log || console;

  if (!req.session) {
    logger.error('[client_auth] error: express-session is required.');
    return next();
  }

  const authHeader = req.header('Authorization');
  if (!authHeader || authHeader.substring(0, 6) !== 'Basic ') {
    return next();
  }

  const userInfo = req.session.userInfo || {};
  if (userInfo.authHeader === authHeader) {
    // 防止已经有身份时重复获取？
    return next();
  }

  const authCode = new Buffer(authHeader.substr(6), 'base64').toString();

  userApi
    .infoByCode({ authcode: authCode })
    .then(function(result = {}) {
      if (result.data && result.data.user) {
        const card = result.data.card;
        const user = result.data.user;
        req.session.userInfo = {
          phoneId: user.phoneUserId,
          phone: user.phone || '',
          name: user.name || (card && card.holderName) || '',
          idNumber: (card && card.cardNum) || '',
          idType: (card && card.cardTypeId) || 0,
          idBindingTime: (card && card.createtime) || '',
          authCode: authCode,
          authHeader: 'Basic ' + new Buffer(authCode).toString('base64')
        };
        if (isDev) {
          logger.info(
            '[client_auth]info: got user info, ',
            JSON.stringify(userInfo)
          );
        }
        return next();
      } else {
        result.message = '[client_auth] error: failed to get user info';
        result.error = result.data;
        throw result;
      }
    })
    .catch(function(error = {}) {
      logger.error('[client_auth]error: fail to get user info by auth header');
      logger.error(error.error || error);
      return next();
    });
};

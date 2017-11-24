const url = require('url');
const querystring = require('querystring');

const config = require('./wechatAuth.config');
const hbrobot = require('./../lib/api/hbrobot');
const userIdentity = require('./../lib/api/userIdentity');
const hbgjSystem = require('./../lib/api/hbgjSystem');

const wechatRedirectPath = process.env.WECHAT_REDIRECT_PATH || '/' + process.env.APP_NAME;
const env = process.env.NODE_ENV || 'dev';
const isDev = env == 'dev';

const logging = (name = '', logger = console) => fn => param => {
  if (isDev)
    logger.info(`[api] ${name} start:`, param);
  return fn(
    param
  ).then(result => (isDev && logger.info(`[api] ${name} result:`, result), result), error => {
    logger.error(`[api] ${name} error:`, error);
    throw error;
  });
};

function isWechat(req) {
  return /MicroMessenger/ig.test(req.get('user-agent'));
}

function toSessionUserinfo(userInfo, authCode) {
  const { user, card } = userInfo;
  return {
    phoneId: user.phoneUserId,
    phone: user.phone || '',
    name: user.name || card && card.holderName || '',
    idNumber: card && card.cardNum || '',
    idType: card && card.cardTypeId || 0,
    idBindingTime: card && card.createtime || '',
    authCode: authCode,
    authHeader: 'Basic ' + new Buffer(authCode).toString('base64'),
    createTime: user.createTime,
    wxOpenid: user.wxOpenid || '',
    wxName: user.wxName || '',
    wxUnionid: user.unionid || ''
  };
}

function getWechatAuthUrl(host, originalUrl) {
  if (originalUrl[0] == '/') {
    originalUrl = '.' + originalUrl;
  }

  if (isDev) {
    host = config.devBaseUrl;
  } else {
    host = 'https://' + host;
  }

  const authUrl = config.authBaseUrl +
    querystring.stringify({
      pid: '602',
      ru: url.resolve(host + wechatRedirectPath + '/', originalUrl)
    });

  const wechatUrl = config.wechatBaseUrl +
    querystring.stringify({
      appid: 'wxfd7a32d944c9b3f5',
      redirect_uri: authUrl,
      response_type: 'code',
      scope: 'snsapi_userinfo',
      state: 'STATE',
      connect_redirect: '1'
    }) +
    '#wechat_redirect';

  return wechatUrl;
}

// 微信身份获取状态
const status = {
  // 正重定向至微信服务器
  REDIRECTING: 'redirecting',
  // 有unionid，已和管家身份关联
  BOUND: 'bound',
  // 有unionid, 还没有和管家身份关联
  UNBOUND: 'unbound'
};

module.exports = {
  /**
   * 微信身份关联中间件
   * 1. 如果检测到是在微信客户端内，前往微信服务器获取微信身份(unionId),
   *    并将微信用户信息写入req.session.wechat.user
   * 2. 检查和unionId关联的phoneId
   *   2.1 有，连同userInfo一起写入session，会话获得管家内用户身份
   *   2.2 没有，标记req.session.wechat.status = 'unbound', 待后续绑定
   */
  identify: function(req, res, next) {
    const logger = req.log || console;

    // skip the non-wechat requests
    if (!isWechat(req)) {
      return next();
    }

    req.session.wechat = req.session.wechat || {};
    const wechat = req.session.wechat;
    const userInfo = req.session.userInfo;
    const wechatKey = req.query.wechatKey;
    logger.info('[wechat]', { wechat, userInfo, wechatKey });

    // 首次进入，还未跳转 | 用户取消跳转 -> 去跳转
    if (!wechat.status || wechat.status === status.REDIRECTING && !wechatKey) {
      logger.info('[wechat] redirecting... ');
      req.session.wechat = {
        originalUrl: req.originalUrl,
        status: status.REDIRECTING
      };
      return res.redirect(getWechatAuthUrl(req.headers.host, req.originalUrl));
    }

    // 去微信授权，用户不提供身份 -> 继续浏览网页?
    if (wechat.status === status.REDIRECTING && wechatKey === 'false') {
      logger.info('[wechat] invalid wechatkey, no identity');
      req.session.wechat = {};
      return next();
    }

    // 成功从微信服务器跳转回来 -> 用wechatKey去获取微信身份(unionId) -> 用微信身份查询管家身份(userInfo)
    if (wechat.status == status.REDIRECTING && wechatKey) {
      logger.info('[wechat] start querying userInfo...');
      var wechatUser, authCode;

      var getUnionId = wechatKey =>
        hbrobot.getWechatInfo({ wechatKey: wechatKey }).then(({ data }) => {
          wechatUser = data;
          return data.unionid;
        });

      var getPhoneId = unionId =>
        userIdentity
        .queryByWeixin({ unionid: unionId })
        .then(result => result.data.phoneid, error => null);

      var getUserInfo = phoneId => {
        return hbgjSystem.user
          .authcode({ userid: phoneId })
          .then(result => result.data)
          .then(data => {
            authCode = data.authcode;
            return authCode;
          })
          .then(authCode => hbgjSystem.user.infoByCode({ authcode: authCode }))
          .then(result => result.data);
      };

      return Promise
        .resolve(wechatKey)
        .then(wechatKey => logging('getUnionId', logger)(getUnionId)(wechatKey))
        .then(unionId => logging('getPhoneId', logger)(getPhoneId)(unionId))
        .then(phoneId => {
          if (phoneId) {
            return logging(
              'getUserInfo',
              logger
            )(getUserInfo)(phoneId).then(userInfo => {
              logger.info('[wechat] got userInfo', userInfo);
              req.session.userInfo = toSessionUserinfo(userInfo, authCode);
              req.session.wechat = { status: status.BOUND, user: wechatUser };
            });
          } else {
            logger.info('[wechat] not connected to a phoneId');
            req.session.wechat = { status: status.UNBOUND, user: wechatUser };
          }
        })
        .then(() => next(), error => {
          logger.error(
            '[wechat] something bad happened:',
            JSON.stringify(error, ' ', 2)
          );
          return next();
        });
    }

    // 有微信身份，已和管家身份绑定
    if (wechat.status === status.BOUND) {
      logger.info('[wechat] got wechat <-> hangban identity');
      return next();
    }
    // 有微信身份，还未与管家身份绑定
    if (wechat.status === status.UNBOUND) {
      logger.info('[wechat] got wechat <-x x-> hangban identity');
      // 现在帮他绑定
      if (req.session.userInfo && req.session.userInfo.phoneId) {
        logger.info('[wechat] start binding...');
        return userIdentity.bindWeixin({
          // 航班管家公众号
          businesstype: 2,
          phoneid: req.session.userInfo.phoneId,
          wxuserinfo: JSON.stringify(req.session.wechat.user)
        }).then(result => {
          logger.info(
            '[wechat] bound!',
            `${req.session.wechat.user.unionid} <--> ${req.session.userInfo.phoneId}`
          );
          req.session.wechat.status = status.BOUND;
          return next();
        }, error => {
          logger.error(
            '[wechat] failed to bound', { wechatUser: wechat.user, hangbanUser: req.session.userInfo },
            error
          );
          return next();
        });
      } else {
        return next();
      }
    }

    // 错误！
    logger.error('[wechat] impossible state:', { wechat: req.session.wechat });
    return next();
  }
};

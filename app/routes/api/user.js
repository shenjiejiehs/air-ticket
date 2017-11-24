const router = require('express').Router();

const hbgj = require('./../../lib/api/hbgj');
const hbgjSystem = require('./../../lib/api/hbgjSystem');
const userIdentity = require('./../../lib/api/userIdentity');

const Buffer = require('buffer').Buffer;
const pipeline = require('./utils/pipeline');
const collect = require('./utils/collect');
const addPhoneId = require('./utils/addPhoneId');
const addAuthCode = require('./utils/addAuthCode');
const addParam = require('./utils/addParam');
const tokenUtil = require('./../../utils/token');
const send = require('./utils/send');

const isDev = /^dev/i.test(process.env.NODE_ENV || 'dev');
const EXPIRES_IN = 30 * 60 * 1000;
// 30分钟失效
/**
 * 获取当前用户的身份信息(userInfo)
 */
router.get('/getUserInfo', function(req, res) {
  const userInfo = req.session.userInfo;
  if (!userInfo) {
    return res
      .status(400)
      .json({ code: 'no_session_auth', msg: '用户未登录或会话超时，请退出重试。' });
  } else {
    const { phone, name, idNumber } = userInfo;
    return res.status(200).json({ phone, name, idNumber });
  }
});

/**
 * 获取当前用户的设备信息(deviceInfo)
 */
router.get('/getDeviceInfo', function(req, res) {
  const deviceInfo = req.session.deviceInfo;
  if (!deviceInfo) {
    return res
      .status(400)
      .json({ code: 'no_device_info', msg: '当前操作仅在客户端内有效' });
  } else {
    return res.status(200).json(deviceInfo);
  }
});

/**
 * 获取一个和当前用户关联的token，30分钟后失效
 * 该API及下面的getByToken用于实现支付，具体参考:
 * http://gitlab.qtang.net/hangban/team-wiki/wikis/webpay
 */
router.get(
  '/getToken',
  pipeline([
    collect(),
    addPhoneId(),
    addAuthCode({ key: 'authcode' }),
    function genToken(payload) {
      const { phoneId, authcode } = payload;
      const token = tokenUtil.sign({ phoneId, authcode }, {
        expiresIn: EXPIRES_IN
      });
      return { token };
    },
    send()
  ])
);

/**
 * 提取token中的用户信息
 *
 * @param token  string
 */
router.get('/getByToken', function(req, res) {
  const payload = Object.assign({}, req.query, req.body);

  const token = payload.token;
  if (!token) {
    req.log.warn('no token provided');
    res.status(400).end();
  } else {
    try {
      const payload = tokenUtil.verify(token);
      res.status(200).json({ data: payload, code: 1 });
    } catch (e) {
      req.log.error('failed to verify token', token);
      req.log.error(JSON.stringify(e));
      res.status(500).end();
    }
  }
});

/**
 * 乘机人信息
 */
router.get(
  '/passenger/load',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'passenger' }),
    hbgj.user.info['4134'],
    send()
  ])
);

router.post(
  '/passenger/add',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'passenger', operation: 'add' }),
    hbgj.user.info['4135'],
    send()
  ])
);

router.post(
  '/passenger/modify',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'passenger', operation: 'modify' }),
    hbgj.user.info['4135'],
    send()
  ])
);

router.post(
  '/passenger/delete',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'passenger', operation: 'delete' }),
    hbgj.user.info['4135'],
    send()
  ])
);

/**
 * 邮寄联系人信息
 */
router.get(
  '/contact/load',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'contact' }),
    hbgj.user.info['4134'],
    send()
  ])
);

router.post(
  '/contact/add',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'contact', operation: 'add' }),
    hbgj.user.info['4135'],
    send()
  ])
);

router.post(
  '/contact/modify',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'contact', operation: 'modify' }),
    hbgj.user.info['4135'],
    send()
  ])
);

router.post(
  '/contact/delete',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'contact', operation: 'delete' }),
    hbgj.user.info['4135'],
    send()
  ])
);

/**
 * 发票信息
 */
router.get(
  '/invoice/load',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'invoice' }),
    hbgj.user.info['4134'],
    send()
  ])
);

router.post(
  '/invoice/modify',
  pipeline([
    collect(),
    addAuthCode(),
    addPhoneId({ key: 'uid' }),
    addParam({ type: 'invoice', operation: 'modify' }),
    hbgj.user.info['4135'],
    send()
  ])
);

/**
 * 获取中文拼音
 */
router.get('/pinyin',
  pipeline([
    collect(),
    hbgjSystem.user.pinyin,
    send()
  ]));

/**
 * 发送手机验证码
 */
router.get(
  '/auth/sendCode',
  pipeline([
    collect(),
    addParam({ smsType: 1 }),
    userIdentity.sendLoginCode,
    send()
  ])
);

/**
 * 用手机验证码获取用户身份
 */
router.get(
  '/auth/verifyLoginCode',
  pipeline([
    collect(),
    verifyUser,
    send()
  ])
);

module.exports = router;

function verifyUser(payload, req, res) {
  const { phone, code } = payload;
  const logger = req.log || console;
  let authcode;
  return userIdentity.verifyLoginCode({ phone, code })
    .catch((payload = {}) => {
      payload.msg = payload.msg || '验证码不正确，请检查后重新输入';
      throw payload;
    })
    .then(({ data }) => {
      authcode = data.authcode;
      return hbgjSystem.user.infoByCode({ authcode });
    })
    .then(({ data }) => {
      if (data && data.user) {
        const card = data.card;
        const user = data.user;
        const userInfo = {
          phoneId: user.phoneUserId,
          phone: user.phone || '',
          name: user.name || card && card.holderName || '',
          idNumber: card && card.cardNum || '',
          idType: card && card.cardTypeId || 0,
          idBindingTime: card && card.createtime || '',
          authCode: authcode,
          authHeader: 'Basic ' + new Buffer(authcode).toString('base64')
        };
        req.session.userInfo = userInfo;
        if (isDev) {
          logger.info(
            '[client_auth]info: got user info, ',
            JSON.stringify(userInfo)
          );
        }
      }
      payload.data = {};
      return payload;
    });
}

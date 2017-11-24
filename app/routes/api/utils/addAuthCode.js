/**
 * 为payload加上authCode
 */
module.exports = ({ required = true, key = 'authCode' } = {}) =>
  (payload, req, res) => {
    let authCode = (req.session.userInfo || {}).authCode;
    if (required && !authCode) {
      throw {
        statusCode: 400,
        code: 'no_session_auth',
        msg: '用户未登录或会话超时，请退出重试。'
      };
    }
    payload[key] = authCode;
    return payload;
  };

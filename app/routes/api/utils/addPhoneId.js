/**
 * 为payload加上phoneId
 */
module.exports = ({ required = true, key = 'phoneId' } = {}) =>
  (payload, req, res) => {
    let phoneId = (req.session.userInfo || {}).phoneId;
    if (required && !phoneId) {
      throw {
        statusCode: 400,
        code: 'no_session_auth',
        msg: '用户未登录或会话超时，请退出重试。'
      };
    }
    payload[key] = phoneId;
    return payload;
  };

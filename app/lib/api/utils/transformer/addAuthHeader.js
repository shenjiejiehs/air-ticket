/**
 * 从Params中提取authCode, 添加到Authorization Header
 */
module.exports = ({ key = 'authCode' } = {}) => options => {
  const payload = options.form || options.qs || {};
  const authCode = payload[key];
  if (authCode) {
    const headers = options.headers || {};
    headers.Authorization = getAuthHeader(authCode);
    options.headers = headers;
    return options;
  } else {
    throw {
      error: {},
      message: '[addAuthHeader] failed to get authCode',
      options: options,
      statusCode: 400
    };
  }
};


function getAuthHeader(authCode) {
  return (authCode.substr(0, 6) == 'Basic ') ?
    authCode : 'Basic ' + (new Buffer(authCode)).toString('base64');
}

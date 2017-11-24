/**
 * 一个token生成/验证工具
 */

const crypto = require('crypto');
const querystring = require('querystring');
const algorithm = 'aes-256-ctr';
const aesKey = 'XZW(&*(@!))';

// 元字段
const VALID_BEFORE = '_vb';
const NONCE = '_n';


/**
 * 根据payload生成一个加密的token
 *
 * @param payload object, 要加密的数据
 * @param option
 *  option.expiresIn  number, token有效时间（毫秒）
 * @returns token string
 */
function sign(payload = {}, { expiresIn } = {}) {
  if (expiresIn) {
    payload[VALID_BEFORE] = new Date().valueOf() + expiresIn;
  }

  payload[NONCE] = Math.floor(Math.random() * 100000);

  var token = querystring.stringify(payload);
  var cipher = crypto.createCipher(algorithm, aesKey);
  var crypted = cipher.update(token, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}


/**
 * 验证token并返回其携带的payload, 验证失败时抛出Error
 *
 * @param token string
 * @return payload object
 */
function verify(token) {
  var decipher = crypto.createDecipher(algorithm, aesKey);
  var dec = decipher.update(token, 'hex', 'utf8');
  dec += decipher.final('utf8');
  var payload = querystring.parse(dec) || {};

  if (payload[VALID_BEFORE]) {
    if (Number(payload[VALID_BEFORE] < new Date().valueOf())) {
      let error = new Error('token expired');
      error.payload = payload;
      error.token = token;
      throw error;
    } else {
      delete payload[VALID_BEFORE];
    }
  }

  if (payload[NONCE]) {
    delete payload[NONCE];
  } else {
    let error = new Error('invalid token');
    error.payload = payload;
    error.token = token;
    throw error;
  }


  return payload;
}


module.exports = { sign, verify };

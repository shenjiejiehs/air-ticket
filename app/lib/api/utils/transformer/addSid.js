const crypto = require('crypto');

module.exports = (...sidFields) =>
  params => {
    if (Array.isArray(sidFields)) {
      const fieldValues = sidFields.map(key => params[key])
        .filter(val => val != null);
      params.sid = generateSid(fieldValues);
    }
    return params;
  }


function generateSid(items) {
  items.push('&*^%@%$^#&');
  const str = new Buffer(items.join('')).toString('binary');
  const md5 = crypto.createHash('md5');
  const strMD5 = md5.update(str, 'binary').digest('hex');
  const sid = strMD5[4] + strMD5[1] + strMD5[16] + strMD5[9] +
    strMD5[19] + strMD5[30] + strMD5[28] + strMD5[22];
  return sid.toUpperCase();
}

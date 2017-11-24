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
  items.push('lke1r(3hd0');
  const str = new Buffer(items.join('')).toString('binary');
  const md5 = crypto.createHash('md5');
  const strMD5 = md5.update(str, 'binary').digest('hex');
  const sid = strMD5[25] + strMD5[31] + strMD5[12] + strMD5[8] +
    strMD5[7] + strMD5[26] + strMD5[4] + strMD5[3];
  return sid.toUpperCase();
}

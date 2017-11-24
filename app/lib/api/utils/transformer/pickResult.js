module.exports = ({ successCode = 0 } = {}) => result => {
  const data = result.data;
  if (data.code == successCode) {
    result.data = data.result || data.data;
    return result;
  } else {
    result.msg = result.message = data.msg;
    result.error = result.data;
    result.statusCode = Number(result.statusCode) > 300 ? result.statusCode : 400;
    throw result;
  }
};

module.exports = ({ successCode = 1 } = {}) => result => {
  const data = result.data;
  if (data.code == successCode) {
    result.data = data;
    return result;
  } else {
    result.msg = result.message = data.errmsg;
    result.error = result.error || data;
    throw result;
  }
};

module.exports = function() {
  return require('rqdir')(__dirname, {
    excludes: /^(utils?)| _\w*/i
  });
};
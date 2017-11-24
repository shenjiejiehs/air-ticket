var rqdir = require('rqdir');
module.exports = rqdir(__dirname, {
  excludes: /(utils?)|_\w*/i
});

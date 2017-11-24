var curry = require('common/fn/curry');

function makeCase($case, input) {
  return {
    'case': $case,
    input: input
  };
}
module.exports = curry(2, makeCase);

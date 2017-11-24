var type = require('common/type');
var assert = require('common/assert');
var stack = require('common/fn/stack');

function $switch(cases) {
  assert(type(cases) === 'object', '[action/switch] argument should be an object!', TypeError);
  return function $stackHandler(ctrl, next, input) {
    var $case = input['case'];
    assert(type($case) === 'string', '[$switchHandler]invalid input value for switchHandler, should have a case property!');
    var handlers = [].concat(cases[$case]);
    assert(handlers.every(function(h) {
      return type(h) === 'function';
    }), '[$switchHandler]invalid handlers for case "' + input.case+'"!');
    var stackHanlder = stack.compose(handlers);
    return stackHanlder(ctrl, next, input.input);
  };
}

module.exports = $switch;

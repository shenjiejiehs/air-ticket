var A = require('./a');
var B = require('./b');

var m = require('m-react');

module.exports = m.createComponent({
  render: function(props){
    return m('.all', [
      m(A, props),
      m(B, props)
    ]);
  }
});

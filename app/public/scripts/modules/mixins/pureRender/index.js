var shadowEqual = require('./shadowEqual');

module.exports = function(){
  return {
    shouldComponentUpdate: function(oldProps, oldState){
      return !shadowEqual(this.state, oldState) || !shadowEqual(this.props, oldProps, true);
    }
  };
};

var toNext = require('buble').transform;
var cfg = require('./config');

module.exports = function(/*options*/){
  return {
    filter: 'js',
    transformer: function(fileObj){
      return {
        path: fileObj.path,
        content: toNext(fileObj.content, cfg).code
      };
    }
  };
};

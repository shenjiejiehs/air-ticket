var IF = require('./if');

module.exports = function(pages, action){
  pages = [].concat(pages);
  return IF(function(_, input){
    return pages.indexOf(input) > -1;
  }, action);
};

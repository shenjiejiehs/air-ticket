var UglifyJS = require('uglify-js');

module.exports = function minify() {

  return {
    filter: 'js',
    transformer: function(fileObj) {
      return {
        path: fileObj.path,
        content: UglifyJS.minify(fileObj.content, {fromString: true}).code
      };
    }
  };
};


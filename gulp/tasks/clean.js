var del = require('del');
module.exports = function cleanTaskLoader(gulp){
  gulp.task('clean', del.bind(null, ['.tmp', 'dist']));
};

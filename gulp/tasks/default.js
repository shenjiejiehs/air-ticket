var runSequence = require('run-sequence');
module.exports = function defaultLoader(gulp, $) {
  // Build Production Files, the Default Task
  gulp.task('default', ['clean'], function(cb) {
    runSequence(['sass', 'eslint'], ['scripts', 'styles', 'images', 'version'], 'copy', 'html', cb);
  });
};
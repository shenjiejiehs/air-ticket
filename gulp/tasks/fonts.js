var runSequence = require('run-sequence');

module.exports = function fontsLoader(gulp, $) {
  // Copy Web Fonts To Dist
  gulp.task('fonts', function() {
    return gulp.src(['app/public/fonts/**'])
      .pipe(gulp.dest('dist/public/fonts'))
      .pipe($.size({
        title: 'fonts'
      }));
  });
};

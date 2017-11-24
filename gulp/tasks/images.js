var path = require('path');

module.exports = function imagesLoader(gulp, $) {
  // Optimize Images
  gulp.task('images', function() {
    return gulp.src([
        'app/public/images/**/*.png',
        'app/public/images/**/*.jpg',
        'app/public/images/**/*.svg',
        'app/public/scripts/**/*.png',
        'app/public/scripts/**/*.jpg',
        'app/public/scripts/**/*.svg'
      ], {
        base: 'app/public'
      })
      .pipe($.if(function(file) {
        return /.png$/.test(file.path);
      }, $.imagemin({
        progressive: true,
        interlaced: true
      })))
      .pipe(gulp.dest('dist/public'))
      .pipe($.size({
        title: 'images'
      }));
  });
}
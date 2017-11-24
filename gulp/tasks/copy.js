module.exports = function copyLoader(gulp, $) {
  // Copy All Files At The Root Level (app)
  gulp.task('copy', function() {
    return gulp.src([
        'app/bin/**',
        'app/boot/**',
        'app/config/**',
        'app/routes/!(test|example)/**',
        'app/routes/!(test|example)',
        'app/lib/**',
        'app/models/**',
        'app/utils/**',
        'app/middleware/**',
        'app/*',
        'app/public/scripts/vendors/**',
        'app/node_modules/**/*',
        '!app/config.*.yml'
      ], {
        base: 'app'
      })
      .pipe(gulp.dest('dist'))
      .pipe($.size({
        title: 'copy'
      }));
  });
};

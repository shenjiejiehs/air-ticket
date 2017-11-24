module.exports = function installLoader(gulp, $) {
  // Install the dependent modules
  gulp.task('install', function() {
    return gulp.src('app/package.json').pipe($.install());
  });
  // Install the dependent modules
  gulp.task('install:dist', ['default'], function() {
    return gulp.src('dist/package.json').pipe($.install());
  });
};

module.exports = function jshintLoader(gulp, $) {
  gulp.task('eslint', function() {
    return gulp.src([
        'app/**/*.js',
        '!app/node_modules/**/*.js',
        '!app/**/*.min.js',
        '!app/public/scripts/{external,vendors}/**/*.js',
        '!app/boot/load-module/transformers/regenerator/runtime.js'
      ])
      .pipe($.eslint({
        quiet: true,
        useEslintrc: true
      }))
      .pipe($.eslint.format('node_modules/eslint-path-formatter'))
      .pipe($.eslint.failAfterError());
  });
};

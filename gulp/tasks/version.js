var git = require('git-rev-sync');

module.exports = function scriptsLoader(gulp, $) {
  // update app version
  gulp.task('version', function() {

    var version = git.short();

    console.log('App Version:', version);

    return gulp.src([
        'app/config.*.yml'
    ], {
      base: 'app'
    })
      .pipe($.replace('<%= VERSION %>', version))
      .pipe(gulp.dest('dist'));
  });
};

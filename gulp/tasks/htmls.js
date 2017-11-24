var pUtil = require('path');
module.exports = function htmlLoader(gulp, $, opts) {
  var outDir = 'dist';
  var staticPath = opts.getAbsPath('dist/public');
  // Scan Your HTML For Assets & Optimize Them
  gulp.task('html', function() {
    return gulp.src([
        'app/public/**/*.html',
        'app/views/**/*.html',
        '!app/public/styles/**/*.html'
      ], {
        base: 'app'
      })
      .pipe($.embed2({
        assetRoot: staticPath,
        parseUrl: function(url) {
          return url.replace('{{{url_base}}}', '').replace('{{url_base}}', '');
        },
        embedResourceUrl: 'png',
        resolveResourceUrl: function(resourceUrl, cssFilePath) {
          return pUtil.resolve(pUtil.dirname(cssFilePath), resourceUrl).replace(staticPath, '{{url_base}}');
        }
      }))
      .pipe($.if('*.html', $.htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
      })))
      // Output Files
      .pipe(gulp.dest('dist'))
      .pipe($.size({
        title: 'html'
      }));
  });
};

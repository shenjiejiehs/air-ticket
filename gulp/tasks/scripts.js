module.exports = function scriptsLoader(gulp, $) {
  // Minify JavaScript
  gulp.task('scripts', function() {
    return gulp.src([
        'app/public/scripts/**/*.js',
        'app/common/**/*.js',
        '!app/public/scripts/vendors/**/*.js'
      ], {
        base: 'app'
      })
      //compile generator functions
      .pipe($.if('!*.min.js', generatorCompile(require('../../app/boot/load-module/transformers/regenerator/config'))))
      //preprocess scripts
      .pipe($.if('!*.min.js', $.preprocess()))
      .pipe($.if(['**/*.js', '!public/scripts/vendors/*.js'], $.buble(require('../../app/boot/load-module/transformers/next-js/config'))))
      .pipe($.if('!*.min.js', $.uglify({
        // preserveComments: 'license'
      }))).on('error', console.log.bind(console))
      .pipe(gulp.dest('dist'))
      .pipe($.size({
        title: 'scripts'
      }));
  });
};


var gutil = require('gulp-util');
var through = require('through2');
var regenerator = require('regenerator');

var genOrAsyncFunExp = /\bfunction\s*\*|\basync\b/;
var STRIP_COMMENTS = /(^\s*(\/\/.*$))|(\/\*[\s\S]*?\*\/)/mg;

function generatorCompile(cfg) {
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-regenerator', 'Streaming not supported'));
      return;
    }

    try {
      var contents = file.contents.toString();
      if (genOrAsyncFunExp.test(contents.replace(STRIP_COMMENTS, ''))) {
        var res = regenerator.compile(contents, cfg);
        file.contents = new Buffer('var regeneratorRuntime=require(\'regenerator-runtime\');' + res.code);
      }
      this.push(file);
    } catch (e) {
      this.emit('error', new gutil.PluginError('gulp-regenerator', e, { filename: file.path }));
    }
    cb();
  });
}

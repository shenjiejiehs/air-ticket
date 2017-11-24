var spawn = require('child_process').spawn;
var pUtil = require('path');
var fs = require('fs');

var merge = require('merge');


module.exports = function serveLoader(gulp, $, opts) {
  var browserSync = opts.browserSync;
  var startBSync = startBrowserSync.bind(null, browserSync, gulp, {
    wsMsgFilter: /signal/i
  });
  gulp.task('serve', ['sass', 'images', 'install'], function() {
    startNodemon($.nodemon, startBSync);
  });

  gulp.task('serve:proxy', ['sass', 'images', 'install'], function() {
    startProxy(browserSync, function() {
      startNodemon($.nodemon, {
        env: {
          APP_NAME: 'web-huoli',
          DEBUG: 'deps-stream:timing',
          GAOTIE_API_HOST_DEFAULT: 'http://127.0.0.1:14343/gaotie_test/',

          GAOTIE_API_HOST_QUERY: 'http://127.0.0.1:14343/gaotie_prod/',
          GAOTIE_API_HOST_USER: 'http://127.0.0.1:14343/gaotie_test/',
          HANGBAN_API_HOST_USER: 'http://127.0.0.1:14343/hangban_test/'
        }
      }, startBSync);
    });
  });
};


//start nodemon app
function startNodemon(nodemon, options, startBSync) {
  if (arguments.length < 3) {
    startBSync = options;
    options = null;
  }
  var started = false;
  var browserSync = null;
  var defaultOpts = {
    watch: [
      'app/*.yml',
      'app/utils/**/*.js',
      'app/lib/**/*.js',
      'app/routes/**/*.js',
      'app/bin/**/*.js',
      'app/common/**/*.js',
      'app/middleware/**/*.js',
      'app/boot/**/*.js'
    ],
    script: 'app/bin/www',
    ext: 'js html tpl yml json',
    stdout: false,
    env: {
      // copy from app/localRun.json
      APP_NAME: 'web-jipiao',
      NODE_ENV: 'dev',
      ENV: 'dev',
      PORT: '3753',
      WECHAT_REDIRECT_PATH: "/jipao",
      DEBUG: 'deps-stream:timing',
      //CASPER_TEST: 1
    }
  };
  nodemon(merge({}, defaultOpts, options)).on('restart', function() {
      console.log('[nodemon]Changed files:');
      console.log.apply(console, arguments);
    }).on('readable', function() {
      var bunyan = spawn(pUtil.join('node_modules', '.bin', (process.platform === 'win32' ? 'bunyan.cmd' : 'bunyan')), [
        '--color'
      ]);
      bunyan.stdout.pipe(process.stdout);
      bunyan.stderr.pipe(process.stderr);

      this.stdout.pipe(bunyan.stdin);
      this.stderr.pipe(bunyan.stdin);
    })
    .on('start', function() {
      if (!started) {
        started = true;
        console.log('<--nodemon is started!');
        if (typeof startBSync === 'function') {
          startBSync(function(bs) {
            browserSync = bs;
          });
        }
      }
      if (browserSync) {
        browserSync.reload();
      }
    });
  // .on('start', console.log.bind(console, 'nodemon start event!!!'));
}


//start browserSync Server
function startBrowserSync(browserSync, gulp, options, cb) {
  if (arguments.length < 4) {
    cb = options;
    options = {};
  }
  var bs = browserSync.create();
  bs.init({
    //browser: "google chrome",
    //browser: "chromium-browser",  // for chromium
    port: 4753,
    ui: false,
    proxy: "localhost:3753",
    reloadDelay: 200, // Wait for the express server ready.
    notify: false,
    startPath: '/welcome',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    // rewriteRules: [{
    //   match: /<!--(\s*)Browsersync_console(\s*)-->/g,
    //   fn: function() {
    //     return "<script>\n" + fs.readFileSync(__dirname + '/serve/browserSync_console.js') + "\n</script>";
    //   }
    // }]
  }, function(err, _bs) {
    if (err) {
      console.error(err);
      return;
    }
    var io = _bs.io;
    // console.dir(io);

    io.on('connection', function(s) {
      s.on('bs::console', function(msg) {
        if (!options.wsMsgFilter || (options.wsMsgFilter && !options.wsMsgFilter.test(msg))) {
          console.log('from Browser: ', msg);
        }
        s.broadcast.emit('bs::console', msg);
      });
    });
    console.log('<-- browserSync is started!!!');
    // setTimeout(bs.reload.bind(bs), 1000);
    bs.reload();
    gulpWatch(gulp, bs.reload);
    if (typeof cb === 'function') {
      cb(bs);
    }
  });
}

// Watch Files For Changes & Reload
function gulpWatch(gulp, reload) {
  gulp.watch(['app/**/*.html'], reload);
  gulp.watch([
    'app/public/**/*.scss'
  ], ['sass:watch']);
  gulp.watch(['app/public/**/*.css'], reload);
  gulp.watch([
    'app/public/scripts/**/*.js',
    'app/public/images/**/*',
    'app/public/fonts/**/*'
  ], reload);
  console.log('<-- files are watched!!!');
}


//start proxy server
function startProxy(browserSync, cb) {
  var bs = browserSync.create('proxy');
  bs.init({
    ui: false,
    open: false,
    notify: false,
    server: {
      baseDir: './',
      middleware: [require('../tasks/serve/prism/prism')()]
    },
    port: 14343
  }, function(err, _bs) {
    if (err) {
      console.error(err);
      return;
    }

    console.log('<-- proxy is started!!!');
    if (typeof cb === 'function') {
      cb(bs);
    }
  });
}

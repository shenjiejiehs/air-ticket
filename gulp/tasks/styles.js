var AUTOPREFIXER_BROWSERS = [
  // 'ie >= 10',
    'ie_mob >= 10',
  // 'ff >= 30',
    'chrome >= 30',
  // 'safari >= 7',
    'opera >= 23',
    'ios >= 6',
    'android >= 2.3'
  // 'bb >= 10'
]
var PREFIX = 'hl-'

module.exports = function stylesLoader(gulp, $, cfg) {
    gulp.task('sass', function() {
        return gulp.src([
            'app/public/**/*.scss',
            '!app/public/styles/hl-ui/**/*.scss'
        ])
      .pipe($.sass({
          precision: 10,
          outputStyle: 'compact'
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe($.if(function(file) {
          return file.path === cfg.getAbsPath('app/public/styles/app.css')
      }, $.cssClassPrefix(PREFIX)))
      .pipe(gulp.dest('app/public'))
    })

    gulp.task('sass:watch', function() {
        return gulp.src([
            'app/public/**/*.scss',
            '!app/public/styles/hl-ui/example/**/*.scss'
        ])
      // .pipe($.changed('app/public', { extension: '.css' }))
      .pipe($.sass({
          precision: 10,
          outputStyle: 'compact'
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe($.if(function(file) {
          return file.path === cfg.getAbsPath('app/public/styles/app.css')
      }, $.cssClassPrefix(PREFIX)))
      .pipe(gulp.dest('app/public'))
    })

    gulp.task('sass-image', function() {
        return gulp.src([
            'app/public/scripts/**/*.png',
            'app/public/scripts/**/*.jpg',
            'app/public/scripts/**/*.svg'
        ], {
          base: 'app/public/scripts'
      })
      .pipe($.if('*.png', $.imagemin({
          progressive: true,
          interlaced: true
      })))
      .pipe(gulp.dest('app/public/styles'))
      .pipe($.size({
          title: 'images'
      }))
    })

    gulp.task('styles', ['sass'], function() {
        return gulp.src([
			                              'app/public/**/*.css',
			                              '!app/public/styles/hl-ui/**/*.css'
		                  ])
      // Concatenate And Minify Styles
      .pipe($.if('*.css', $.csso(true)))
      // .pipe($.if('*.m.css', $.postcss([
      //   require('postcss-modules')({
      //     getJSON: function(){},
      //     generateScopedName: function(name, filename){
      //       var id = stringHash(getContent(filename));
      //       return '_' + name+'_'+id;
      //     }
      //   })
      // ])))
      .pipe(gulp.dest('dist/public'))
      .pipe($.size({
          title: 'styles'
      }))
    })
}


// function stringHash(str) {
//   var hash = 5381,
//     i = str.length;

//   while (i)
//     hash = (hash * 33) ^ str.charCodeAt(--i);
//   return (hash >>> 0).toString(36);
// }

// var fs = require('fs');

// function getContent(path){
//   var content;
//   try{
//     content = fs.readFileSync(path,'utf-8');
//   }catch(e){
//     console.error(e);
//     content = '';
//   }
//   return content;
// }
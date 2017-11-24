'use strict';
var gulp = require('gulp');
var pUtil = require('path');
require('gulp-load-dir')(gulp, {
  browserSync: require('browser-sync'),
  getAbsPath: function(relativePath){
    return pUtil.resolve(__dirname, relativePath);
  }
});

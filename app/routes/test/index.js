var express = require('express');
var router = express.Router({ caseSensitive: true });
var fs = require('fs');
var path = require('path');

router.get('/module/*', function(req, res) {
  var module = req.params[0];
  res.render('test/module', {
    module: module,
    layout: 'layout.html'
  });
});

router.get('/component/*', function(req, res) {
  var module = req.params[0];
  res.render('test/component', {
    module: module,
    layout: 'layout.html'
  });
});

/**
 * 在开发环境下，增加组件展示页入口
 * 该页面展示所有spec.js
 */

if (/(test|dev)/i.test(process.env.NODE_ENV || 'dev')) {
  var components = null;
  router.get('/catalogue', function(req, res) {
    components = components || JSON.stringify(getComponents(req.app)); // 只在第一次请求时索引目录， 避免每次文件改变都索引
    console.log('components ', components);
    var selected = JSON.stringify(req.query.selected || '');
    res.render('test/catalogue', {
      selected: selected,
      components: components
    });
  });
}

// helper
function getComponents(app) {
  var scriptsDir = path.join(app.get('$boot_dir'), '../public/scripts');
  return loadFiles(scriptsDir)
    .filter(function(file) {
      return /\/spec\.js$/.test(file);
    })
    .map(function(file) {
      return /public\/scripts\/(.+)\/spec\.js$/.exec(file)[1];
    });
}

function loadFiles(dir) {
  var files = fs.readdirSync(dir, { encoding: 'utf8' }).reduce(function(
    prev,
    cur
  ) {
    if (cur.indexOf('.') == -1) {
      // 姑且认为文件名不包含'.'的是目录
      return prev.concat(loadFiles(path.resolve(dir, cur)));
    } else {
      return prev.concat(path.resolve(dir, cur));
    }
  }, []);
  return files;
}

module.exports = router;

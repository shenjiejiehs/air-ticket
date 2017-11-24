/**
 * 特价机票
 * 具体页面入口和参数参见 public/scripts/special/index
 */
const router = require('express').Router();

router.get('/*', function(req, res) {
  res.render('general.html', {
    title: '特价机票',
    startModule: 'special/index',
    layout: 'layout.html'
  });
});

module.exports = router;

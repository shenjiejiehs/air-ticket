var router = require('express').Router();
var userAuth = require('../middleware/userAuth.js');

/**
 * 乘机人
 */
router.get('/passenger', userAuth, function(req, res) {
  res.render('user/passenger/index.html', {
    title: '乘机人',
    layout: 'layout.html'
  });
});

module.exports = router;

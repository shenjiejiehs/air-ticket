var router = require('express').Router();

router.get('/', function(req, res) {
  const { delay = 0 } = req.query || {};
  setTimeout(function() {
    res.status(200).end();
  }, delay);
});

module.exports = router;

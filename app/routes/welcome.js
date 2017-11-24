var router = require('express').Router();

router.get('/', function(req, res){
  res.status(200).render('welcome.html');
});

module.exports = router;

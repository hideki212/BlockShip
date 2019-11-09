var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {layout: 'default', template: 'home-template'});
});

module.exports = router;

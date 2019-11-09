var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/editprofile', function(req, res, next) {
  res.render('users/editprofile', {layout: 'default'});
});
router.get('/createbilloflading', function(req, res, next) {
  res.render('users/createbilloflading', {layout: 'default'});
});
router.get('/analytics', function(req, res, next) {
  res.render('users/analytics', {layout: 'default'});
});
module.exports = router;

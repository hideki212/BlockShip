var express = require('express');
var router = express.Router();
var cookieParser = require("cookie-parser");
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.login){
    res.redirect("/user/dashboard");
  }else{
    req.session.email = "test";
    res.cookie('token', "000000");
    res.cookie('tokenType', "000000");
    res.render('index', {layout: 'default', template: 'home-template'});
  }
});

module.exports = router;

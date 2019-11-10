var express = require("express");
var router = express.Router();
const request = require("request");
/* GET users listing. */
router.get("/", function(req, res, next) {
  if (!req.session.login) {
    return res.redirect("/");
  } else {
    return res.render("users/dashboard", { layout: "default", login: true, session: req.session });
  }
  
});
router.get("/editprofile", function(req, res, next) {
  if (!req.session.login) {
    return res.redirect("/");
  } else {
    return res.render("users/editprofile", { layout: "default", login: true, session: req.session });
  }
  
});
router.get("/createbilloflading", function(req, res, next) {
  if (!req.session.login) {
    return res.redirect("/");
  } else {
    return res.render("users/createbilloflading", { layout: "default", login: true, session: req.session });
  }
});
router.get("/analytics", function(req, res, next) {
  if (!req.session.login) {
    return res.redirect("/");
  } else {
    return res.render("users/analytics", { layout: "default", login: true, session: req.session });
  }
});

router.post("/login", function(req, res, next) {
  request.post(
    {
      url: "http://localhost:3000/ico/login",
      form: { email: req.body.email, password: req.body.password }
    },
    function(err, httpResponse, body) {
      if (err) {
        console.error("Login failed error :" + err);
        return res.json({ success: false, message: err });
      }
      var data = JSON.parse(body);
      if (!data.success) {
        return res.redirect("/");
      }
      req.session.login = true;
      req.session.publicKey = data.publicKey;
      req.session.email = data.email;
      res.cookie("token", data.token);
      res.cookie("tokenType", "Bearer");
      req.session.uid = data.uid;
      req.session.userType = data.userType;
      console.log(req.session.uid);
      console.log(req.session.uid);
      return res.redirect("/users/");
    }
  );
});

router.post("/createbilloflading", (req, res, next) => {
  if (!req.session.login) {
    return res.redirect("/");
  } else {
    console.log(req.body);
    request.post(
      {
        url: "http://localhost:3000/ico/transact",
        headers: {
          authorization:
            req.session.cookie.tokenType + " " + req.session.cookie.token
        },
        form: req.body
      },
      function(err, httpResponse, body) {
        console.log({
          authorization:
            req.session.cookie.tokenType + " " + req.session.cookie.token
        });
        body = JSON.parse(body);
        console.log(body);
        if (err) {
          console.error("Login failed error :" + err);
          return res.json({ success: false, message: err });
        }
        if (!body.success) {
          return res.json({ success: false, message: body });
        }
        if (!req.session.login) {
          return res.redirect("/");
        }

        req.session.login = true;
        res.cookie("token", body.token);
        res.cookie("tokenType", "Bearer");
        return res.render("users/createbilloflading", { layout: "default", login: true, session: req.session, sucess: true });
      } 
    );
    return res.render("users/createbilloflading", { layout: "default", login: true, session: req.session, success:false });
  }
});
router.get('/logout', function(req, res) {
  req.session.destroy(function(err){
     if(err){
        console.log(err);
     }else{
        req.session = null; 
        res.clearCookie('token');
        res.clearCookie("tokenType")
        res.redirect('/');
     }
  });

});

module.exports = router;

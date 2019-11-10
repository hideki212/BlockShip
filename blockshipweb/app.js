var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');
const session = require('express-session');
var logger = require("morgan");
var hbs = require("express-handlebars");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var app = express();
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});
app.set("view engine", "hbs");
app.use(session({key: 'user_sid',secret:"secretSessionVariable", saveUninitialized : true, resave : true, cookie: {
  expires: 600000
}}));
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultView: "index",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/"
  })
);
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/dashboard');
  } else {
      next();
  }    
};
app.use(logger("dev"));
app.use(express.json());

app.use("/public", express.static("public"));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

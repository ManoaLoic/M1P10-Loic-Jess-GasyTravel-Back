require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
cors = require('cors');

const mongoose = require("mongoose");

// var indexRouter = require('./routes/index');
const userType =require("./routes/userType");
const users = require("./routes/users");
const auth = require("./routes/auth");
const checkJWT = require("./middleware/auth");
var postsRouter = require('./routes/posts');
// const bodyParser = require("body-parser");

// let {fireBaseApp, analytics} = require("./middleware/firebase");

const conn_str = `mongodb+srv://loic:loic1234@cluster0.vwkhc.mongodb.net/${encodeURIComponent('GasyTravel')}?retryWrites=true&w=majority`;
  mongoose.connect(
    conn_str,
    { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
    },(err) => {
    if (err) {
      console.log("error in connection", err);
    } else {
      console.log("mongodb is connected");
    }});

var app = express();

// var originsWhitelist = [
//   'http://localhost:4200',
// ];

// var corsOptions = {
//   origin: function(origin, callback){
//         var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
//         callback(null, isWhitelisted);
//   },
//   credentials:true
// }

// app.use(cors(corsOptions));

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/auth", auth);

app.use("/users", users);
app.use(checkJWT);

app.use("/userType", userType);
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: false
// }));
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

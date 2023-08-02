require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const mongoose = require("mongoose");

// let indexRouter = require("./routes/index");
const userType =require("../routes/userType");
const users = require("../routes/users");
const auth = require("../routes/auth");
const checkJWT = require("../middleware/auth");
const postsRouter = require("../routes/posts");

// let {fireBaseApp, analytics} = require("./middleware/firebase");

const connStr = `mongodb+srv://loic:loic1234@cluster0.vwkhc.mongodb.net/${encodeURIComponent("GasyTravel")}?retryWrites=true&w=majority`;
mongoose.connect(connStr,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    },(err) => {
        if (err) {
            console.log("error in connection", err);
        } else {
            console.log("mongodb is connected");
        }
});

const app = express();

const originsWhitelist = [
"http://localhost:4200",
];

const corsOptions = {
origin: function(origin, callback){
        let isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback (null, isWhitelisted);
},
credentials:true
}

app.use(cors(corsOptions));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", auth);

app.use("/users", users);
app.use(checkJWT);

app.use("/userType", userType);
app.use("/posts", postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get("env") === "development" ? err : {};

// render the error page
res.status(err.status || 500);
res.render("error");
});

module.exports = app;
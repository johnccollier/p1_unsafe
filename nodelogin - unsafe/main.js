var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
var csrf = require('csurf'); //security for CSRF attacks
var bcrypt = require('bcryptjs');

//Set up mongoose connection
var url = 'mongodb://dblem:blueteam123@ds263018.mlab.com:63018/blue_team_data';
mongoose.connect(url);
const db = mongoose.connection;

//database error handling
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
	//Connected!
	console.log('Successfully connected to database');
  });


//import user model
require('./models/user.js');
var  User =  mongoose.model('user');

//setup template engine
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");



//import controllers
var userController = require('./controllers/user.js');


//Use sessions to keep track of logins
app.use(sessions({
    cookieName: 'session',
    secret: 'kjsdfbdbkdfbijbifvkmbouiefeufbefibqew', //private secret key for session data encryption
    resave: true,
    saveUninitialized: false,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

//set up bower middleware
app.use(express.static('bower_components'));

//parser for incoming requests
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

//CSRF protection
//app.use(csrf());



//Check if session is set then add user for every request
app.use(function(req, res, next) {
    if (req.session && req.session.user) {
        var user = userController.getUser(req.user.email, function(err, user) {
            if (user != null) {
                req.user = user;
                delete req.user.password;
                req.session.user = req.user;
                res.locals.user = req.user;
                next();
            } else {
                next();
            }
        });
    } else {
        next();
    }
});

//require login middleware
function requireLogin(req, res, next) {
    if (!req.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

//GET requests
app.get('/', function(req, res) {
  if (req.session.message) {
    var x = req.session.message;
    delete req.session.message;
    res.render("home", {message: x});
} else if (req.session.error) {
    var x = req.session.error;
    delete req.session.error;
    res.render("home", {error: x});
} else {
    res.render("home");
}
});


app.get("/register", function(req, res) {
        res.render("register");
});


app.get("/login", function(req, res) {
    res.render("login");
});


  app.get("/dashboard", requireLogin, function (req, res, next) {
    res.render("dashboard");
  });


  app.get("/logout", function(req, res) {
    req.session.reset();
    res.send('Session Logged out.<br> <a href="/login">Login Again</a>');
});


//POST requests
app.post("/login", function(req, res) {
    User.findOne({ email: req.body.email })
    .exec(function (err, user) {
      if (err) {
        res.render("login");
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        res.render("login");
      }
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (res) {
          res.redirect('/dashboard');
        } else {
          res.render("login");
        }
      })
    });
});

   /* User.findOne({'email':req.body.email,'password':req.body.password},function(err,data){
        if(err){
            res.send(err);
        }else if(data){
            //res.send('User Login Successful');
            res.render("dashboard");
        }else {
            res.send('Wrong Username Password Combination');
        }
    }) */


/*on post managing function using call back functions*/
app.post("/register", function(req, res, next) {
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var userData = {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        email: req.body.email,
        password: hash
    }
    User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/dashboard');
        }
      });

       


});




//Catch 404 errors and forwards to error handler
app.use(function (req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
  });


/*
Error handler
Define as the last app.use callback 
*/
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);
  });


  
app.listen(3000, function () {
	console.log('Express app listening on port 3000!');
  });
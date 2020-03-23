var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
var csrf = require('csurf'); //security for CSRF attacks
var bcrypt = require('bcryptjs');

//Set up mongoose connection
mongoose.connect('mongodb://dblem:blueteam123@ds263018.mlab.com:63018/blue_team_data');
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
        var user = userController.getUser(req.session.user.email, function(err, user) {
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
    res.render("home");
});


app.get("/register", function(req, res) {
    if (req.session.message) {
        var x = req.session.message;
        delete req.session.message;
        res.render("register", {message: x,csrfToken: req.csrfToken()});
    } else if (req.session.error) {
        var x = req.session.error;
        delete req.session.error;
        res.render("register", {error: x,csrfToken: req.csrfToken()});
    } else {
        res.render("register", {csrfToken: req.csrfToken()});
    }
});


app.get("/login", function(req, res) {
    res.render("login");
});


  app.get("/dashboard", function (req, res, next) {
	User.findById(req.session.userId)
	  .exec(function (error, user) {
		if (error) {
		  return next(error);
		} else {
		  if (user === null) {
			var err = new Error('Not authorized! Go back!');
			err.status = 400;
			return next(err);
		  } else {
			return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
		  }
		}
	  });
  });


  app.get("/logout", function(req, res) {
    req.session.reset();
    res.send('Session Logged out.<br> <a href="/login">Login Again</a>');
});


//POST requests
app.post("/login", function(req, res) {
    User.findOne({'email':req.body.email,'password':req.body.password},function(err,data){
        if(err){
            res.send(err);
        }else if(data){
            //res.send('User Login Successful');
            res.render("dashboard");
        }else {
            res.send('Wrong Username Password Combination');
        }
    })
});

/*on post managing function using call back functions*/
app.post("/register", function(req, res) {
    userController.registerUser(req, function(err, registered) {
        if (registered == true) {
            var message = "User registered successfully";
            req.session.message = message;
            res.redirect('/');
        } else {
            req.session.error = err;
            res.redirect("/register");
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
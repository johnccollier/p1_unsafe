var express = require('express');
var app = express.Router();
var User = require('../models/user');


// GET route for reading data
app.get('/', function (req, res, next) {
    res.render("login");
  });


//POST route for updating data
app.post('/', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
      var err = new Error('The passwords do not match.');
      err.status = 400;
      res.send("Password does not match");
      return next(err);
    }
    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {
    
        var userData = {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
        }
    
        User.create(userData, function (error, user) {
          if (error) {
            return next(error);
          } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
          }
        });

    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
          if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
          } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
          }
        });
      } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
      }
    })

    app.get('/profile', function (req, res, next) {
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

// GET for logout logout
app.get('/logout', function (req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });
  
  module.exports = app;
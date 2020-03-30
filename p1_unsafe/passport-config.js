
const LocalStategy = require("passport-local").Strategy;

const User = require('./models/user.js');

module.exports = passport => {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });



  // Login
  passport.use("local-login", new LocalStategy({
    passReqToCallback: true
  }, (req, email, password, done) => {
    User.findOne({
      email: email
    }, (err, user) => {
      console.log(user);
      if (err) throw err;
      // req.flash is the way to set flashdata using connect-flash
      if (!user)
        return done(null, false, req.flash("loginMessage", "No user found."));
      if (!user.validatePassword(password))
        return done(null, false, req.flash("loginMessage", "Oops! Wrong password.")); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user);
    });
  }));
};
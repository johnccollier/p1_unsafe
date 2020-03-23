var bcrypt = require('bcryptjs');
var User = require('.././models/user.js');


exports.tryLogin = function(req, res) {
    User.findOne({'email':req.body.email,'password':req.body.password},function(err,data){
        if(err){
            res.send(err);
        }else if(data){
            res.send('User Login Successful');
        }else {
            res.send('Wrong Username Password Combination');
        }
    })
};

/*registerUser inplemented with callback function only */
exports.registerUser = function(req, cb) {
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash
    });
    user.save(function(err) {
        if (err) {
            var error = 'something went wrong!';
            if (err.code === 11000) {
                error = 'Email already registered, try another!';
            }
            cb(error, null); //calling callback and return value as per need
        } else {
            cb(null, true);
        }
    });
};

exports.getUser = function(email, cb) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (user) {
            cb(null, user);
        } else {
            cb("User not found", null);
        }
    });
}
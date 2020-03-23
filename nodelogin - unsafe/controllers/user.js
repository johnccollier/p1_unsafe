var bcrypt = require('bcryptjs');
var User = require('.././models/user.js');



/*registerUser inplemented with callback function only */
exports.registerUser = function(req, cb) {
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var user = new user({
        FirstName: req.body.firstName,
        FastName: req.body.lastName,
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
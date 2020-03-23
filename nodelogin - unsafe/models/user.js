const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    //id: ObjectId,
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    FirstName: String,
    LastName: String,
    password: {
      type: String,
      required: true,
    },
    acctBalance: {
        type: Number,
        required: false   
    }
  });

  UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
  }



  //Hash password before saving to database
  UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });


mongoose.model('user', UserSchema);
module.exports = UserSchema;

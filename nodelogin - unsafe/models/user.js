const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new mongoose.Schema({
    id: ObjectId,
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
    },
    acctBalance: {
        type: Number,
        required: false   
    }
  });

mongoose.model('user', UserSchema);
module.exports = UserSchema;

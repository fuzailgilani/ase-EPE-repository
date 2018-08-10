var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  SAPNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  subordinates: {
    type: Array,
    required: false
  },
  superiors: {
    type: Array,
    required: false
  }
  // email: {
  //   required: true,
  //   trim: true,
  //   type: String,
  //   minlength: 1
  // }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};

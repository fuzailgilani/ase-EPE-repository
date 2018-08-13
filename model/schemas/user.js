var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  SAPNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subordinates: [{
    type: String,
    required: true
  }],
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
  // superiors: {
  //   type: Array,
  //   required: false
  // }
  // email: {
  //   required: true,
  //   trim: true,
  //   type: String,
  //   minlength: 1
  // }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};

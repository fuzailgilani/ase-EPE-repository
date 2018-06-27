var mongoose = require('mongoose');

var User = mongoose.model('User', {
  SAPNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  subordinates: {
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

module.exports = {User};

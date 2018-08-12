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
  },
  department: {
    type: String,
    required: true
  },
  division: {
    type: String,
      required: true
  },
  title: {
    type: String,
      required: true
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};

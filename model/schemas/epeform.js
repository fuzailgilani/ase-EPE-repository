var mongoose = require('mongoose');

var EPEFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  SAPNumber: {
    type: String,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  approvalRequired: {
    type: Boolean,
    required: true,
    default: true
  },
  approvalFrom: [{
    type: String,
    required: false
  }]
});

var EPEForm = mongoose.model('EPEForm', EPEFormSchema);

module.exports = {EPEForm};

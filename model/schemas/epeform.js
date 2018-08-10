var mongoose = require('mongoose');

var EPEFormSchema = new mongoose.Schema({
  SAPNumber: {
    type: String,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  approvalFrom: [{
    type: Object,
    required: true
  }]

});

var EPEForm = mongoose.model('EPEForm', EPEFormSchema);

module.exports = {EPEForm};

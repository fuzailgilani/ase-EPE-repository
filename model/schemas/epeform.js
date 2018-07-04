var mongoose = require('mongoose');

var EPEForm = mongoose.model('EPEForms', {
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
  approvalFrom: {
    type: Array,
    required: false,
    default: []
  }
});

module.exports = {EPEForm};

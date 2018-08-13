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
  empTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  formContent: [{
    goal: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: false
    }
  }],
  approvalFrom: [{
    type: String,
    required: true
  }],
  approvalRequired: {
    type: Boolean,
    required: true
  },
  reportingPeriod: {
    type:String,
    required:true
  },
  dateCreated: {
    type: Number,
    required: true
  }
});

var EPEForm = mongoose.model('EPEForm', EPEFormSchema);

module.exports = {EPEForm};

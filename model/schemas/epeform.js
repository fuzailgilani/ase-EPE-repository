var mongoose = require('mongoose');

var EPEFormSchema = new mongoose.Schema({
  SAPNumber: {
    type: String,
    required: true
  },
    name: {
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
          required: true
      },
  }],
  approvalFrom: [{
    type: Number,
    required: true
  }],
  reportingPeriod: {
    type:String,
    required:true
  }

});

var EPEForm = mongoose.model('EPEForm', EPEFormSchema);

module.exports = {EPEForm};

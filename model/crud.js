var mongoose = require('mongoose');
var {EPEForm} = require('./schemas/epeform');
var {User} = require('./schemas/user');

// utility function to submit form - TODO error handling
var submitForm = (formData) => {
  // create EPEForm object with data passed in argument
  var newEPEForm = new EPEForm(formData);

  // save form to database, then return Promise with result of saving to database
  return newEPEForm.save().then((doc) => {
    return doc;
  }, (err) => {
    res.redirect('/error?message=Form%20creation%20unsuccessful');
  });
};

// utility function to retrieve many EPEForms from database - TODO error handling
var getEPEsFromDB = (mode, user) => {
  // check if data retrival is from approve or archive request
  var approvalRequired;
  if (mode === 'approve'){
    approvalRequired = true;
  } else if (mode === 'archive'){
    approvalRequired = false;
  }

  // fetch all EPEs require approval if approve, that don't if archive, and return Promise with result of database retrieval
  return EPEForm.find({approvalRequired}).then((epeFormsRes) => {
    return epeFormsRes;
  }, (err) => {
    res.status(400).send(err);
  });
};

// utility function to verify login credentials; dummy function for now - TODO incorporate authentication
var verifyCredentials = (loginCredentials) => {
  const dummyLoginCredentials = [{
      userName: "employee1",
      pass: "password1"
    },{
      userName: "employee2",
      pass: "password2"
    },{
      userName: "employee3",
      password: "password3"
    },{
      userName: "employee4",
      pass: "password4"
    },{
      userName: "employee5",
      pass: "password5"
    }
  ];
  var i;
  for(i = 0; i < dummyLoginCredentials.length; i++){
    if(dummyLoginCredentials[i].userName === loginCredentials.userName && dummyLoginCredentials[i].pass === loginCredentials.password){
      return true;
    }
  }
  return false;
};

// export crud functions for use in server.js
module.exports = {getEPEsFromDB, verifyCredentials, submitForm};

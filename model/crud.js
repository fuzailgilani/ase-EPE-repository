var mongoose = require('mongoose');
var {EPEForm} = require('./schemas/epeform');
var {User} = require('./schemas/user');

var getEPEsFromDB = (mode, user) => {
  var approvalRequired;
  if (mode === 'approve'){
    approvalRequired = true;
  } else if (mode === 'archive'){
    approvalRequired = false;
  }
  var epeForms;
  return EPEForm.find({approvalRequired}).then((epeFormsRes) => {
    return epeFormsRes;
  }, (err) => {
    res.status(400).send(err);
  });
};

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
    if(dummyLoginCredentials[i].userName === loginCredentials.userName && dummyLoginCredentials[i].pass === loginCredentials.pass){
      return true;
    }
  }
  return false;
};

module.exports = {getEPEsFromDB, verifyCredentials};

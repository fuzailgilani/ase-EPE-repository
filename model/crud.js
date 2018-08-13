const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');

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
    console.log(err);
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

// utility function to retrieve single EPE form from DB using _id field
var getEPEById = (id) => {
  // check if the id string is a valid mongodb ObjectID
  if (!ObjectID.isValid(id)) {
    return Promise.reject();
  }

  // find the form in the data base, and return it if found
  return EPEForm.findById(id).then((epeForm) => {
    if (!epeForm){
      return Promise.reject();
    }

    return epeForm;
  }).catch((err) => {
    return Promise.reject();
  });
};

var getEPEsBySAP = (SAPNumber) => {
  return EPEForm.find({SAPNumber}).then((epeForms) => {
    return epeForms;
  }, (err) => {
    console.log(err);
  });
};

var addGoals = (id, goals) => {
  if (!ObjectID.isValid(id)) {
    return Promise.reject();
  }

  return EPEForm.findById(id).then((epeForm) => {
    if (!epeForm) {
      return Promise.reject();
    }

    var body = {};

    body.formContent = epeForm.formContent;

    var i;
    for (i = 0; i < goals.length; i++){
      body.formContent.push(goals[i]);
    }

    return EPEForm.findByIdAndUpdate(id, {$set: body}, {new: true}).then((newEpeForm) => {
      if(!newEpeForm){
        return Promise.reject();
      }
      return newEpeForm;
    });
  }).catch((err) => {
    console.log(err);
    return Promise.reject();
  });
};

var addRatings = (id, ratings) => {
  if(!ObjectID.isValid(id)) {
    return Promise.reject();
  }

  return EPEForm.findById(id).then((epeForm) => {
    if (!epeForm) {
      return Promise.reject();
    }
    var body = {};

    body.formContent = epeForm.formContent;

    for(var index in ratings) {
      body.formContent[parseInt(index)].rating = parseInt(ratings[index]);
    }

    console.log(body);
    return EPEForm.findByIdAndUpdate(id, {$set: body}, {new: true}).then((newEpeForm) => {
      if(!newEpeForm) {
        return Promise.reject();
      }
      return newEpeForm;
    });
  }).catch((err) => {
    console.log(err);
    return Promise.reject();
  });
};

// utility function to approve an EPE from the current user
var approveEPE = (id, approvedBy) => {
  // check if the id string is a valid mongodb ObjectID
  if (!ObjectID.isValid(id)) {
    return Promise.reject();
  }

  // first find the EPE form associated with the id - need to check the current content before making appropriate changes
  return EPEForm.findById(id).then((epeForm) => {
    if (!epeForm){
      return Promise.reject();
    }

    // first, fetch the approvalFrom array and find out if the user approving it is authorized to do so
    epeFormApprovalArray = epeForm.approvalFrom;
    var indexOfSAP = epeFormApprovalArray.indexOf(approvedBy);

    // if the user is in the list of users required to approve the form, then proceed
    if(indexOfSAP !== -1) {
      // first, remove current user from the approvalFrom array
      epeFormApprovalArray.splice(indexOfSAP, 1);

      // then, create body object containing all the fields that are to be updated
      var body = {};

      // approvalFrom is the new, modified approvalFrom array with current user removed
      body.approvalFrom = epeFormApprovalArray;
      // approvalRequired is set to whether the approvalFrom array is empty or not; if it is empty, then the form is archived
      body.approvalRequired = (epeFormApprovalArray.length !== 0);
      // if the body is not archived, let archivedOn be null, else, get timestamp of current time and set archivedOn to that
      body.archivedOn = null;
      if (!body.approvalRequired) {
        body.archivedOn = new Date().getTime();
      }

      // update the epe with the appropriate changes, and return the modified EPE body
      return EPEForm.findByIdAndUpdate(id, {$set: body}, {new: true}).then((newEpeForm) => {
        if(!newEpeForm){
          return Promise.reject();
        }
        return newEpeForm;
      });
    } else {
      return Promise.reject();
    }
  }).catch((err) => {
    console.log(err);
    return Promise.reject();
  });
};

// utility function to verify login credentials; dummy function for now - TODO incorporate authentication
var verifyCredentials = (loginCredentials) => {
  return User.find(loginCredentials).then((user) => {
    return user;
  }, (err) => {
    console.log(err);
  });
};

// export crud functions for use in server.js
module.exports = {getEPEsFromDB, verifyCredentials, submitForm, getEPEById, getEPEsBySAP, approveEPE, addGoals, addRatings};

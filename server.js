require('./config/config')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const hbs = require('hbs');

var {mongoose} = require('./model/mongoose');
var {EPEForm} = require('./model/schemas/epeform');
var {User} = require('./model/schemas/user');
var {getEPEsFromDB, verifyCredentials, submitForm, getEPEById, approveEPE} = require('./model/crud');

var app = express();
const port = process.env.PORT;

// DUMMY FUNCTIONS FOR now

var getCurrentUserSuperiors = () => {
  return ['64', '234', '653', '123'];
}

var validateForm = (formData) => {
  //Only validating the length of the SAP number, should be 6 characters
  if (formData.SAPNumber.length == 6) {
    return true;
  }
  return false;
  //return (formData.empTitle && formData.employeeName && formData.SAPNumber);
};

// set up parsing for Express app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up view engine to handlebars for Express app
app.set('view engine', 'hbs');

// GET / - login page
app.get('/', (req,res) => {
  console.log('GET /');
  // if request query contains error message, then include it in body for handlebars
  var body = _.pick(req.query, ['errorMessage']);

  // render login page
  res.render('login.hbs', body);
});

// POST / - verify login credentials
app.post('/', (req,res) => {
  console.log('POST /');
  console.log(req.body);

  // retrieve login credentials from request body using lodash
  var loginCredentials = _.pick(req.body, ['userName', 'password']);

  // if user typed in username and password into form
  if (loginCredentials.userName != "" && loginCredentials.password != "") {
    // verify credentials and redirect appropriately (to GET /home if success, to GET / with error message if not)
    /* Commenting out to dummy for presentation
    if (verifyCredentials(loginCredentials)){
       res.redirect('/home')
    }  else {
      res.redirect('/?errorMessage=Invalid%20login%20credentials')
    }
    */
    //Begin dummy code
    var successCode = verifyCredentials(loginCredentials);
    if (successCode == 1) {
      res.redirect('/home');
    } else if (successCode == 2) {
      res.redirect('/emphome');
    }
    else {
      res.redirect('/?errorMessage=Invalid%20login%20credentials');
    }
  // if user did not include username or pass, then redirect to GET / without any message
  } else {
    res.redirect('/');
  }
  //End dummy code
});

// GET /success - if any operation (creating form, updating form) is a success, redirect here
app.get('/success', (req,res) => {
  console.log('GET /success');
  var body = _.pick(req.query, ['message']);

  res.render('success.hbs', body);
});

// GET /error - if any operation (creating form, updating form) fails, redirect here
app.get('/error', (req,res) => {
    console.log('GET /error');
  var body = _.pick(req.query, ['message']);

  res.render('error.hbs', body);
});

// GET /home - home page with nav bar, displayed after login
app.get('/home', (req,res) => {
  console.log('GET /home');
  console.log(req.query);
  res.render('home.hbs'); // TODO create home page
});

// GET /create - display EPE HTML form
app.get('/create', (req,res) => {
  console.log('GET /create');
  console.log(req.query);
  // if request query contains error messages and previously filled in values, include in body for handlebars
  var body = _.pick(req.query, ['errorMessages', 'filledInValues']);

  // render form creation page
  res.render('create.hbs', body); //TODO create login html/angular page
});

app.get('/addgoals', (req,res) => {
  console.log('GET /addgoals');
  console.log(req.query);

  res.render('addgoals.hbs');

});

//BEGIN dummy code
app.get('/approveemp', (req,res) => {
  console.log('GET /approveemp');
  console.log(req.query);

  res.render('approveemp.hbs');
});

app.get('/emphome', (req,res) => {
  console.log('GET /emphome');
  console.log(req.query);

  res.render('emphome');
});

app.get('/archiveemp', (req,res) => {
  console.log('GET /archiveemp');
  console.log(req.query);

  res.render('archiveemp');
});
//END dummy code

// POST /create - validate whether form is ready for database or not
app.post('/create', (req,res) => {
  console.log('POST /create');
  console.log(req.body);
  // pick submitted form data using lodash
  var submittedFormData = _.pick(req.body, ['employeeName', 'SAPNumber', 'empTitle', 'department', 'division', 'reportingPeriod']);

  // if form is valid, then take steps to submit it to database
  if (validateForm(submittedFormData)){
    // first, add approvalFrom array (should not be submitted by user)
    formData = {
      name: submittedFormData.employeeName,
      SAPNumber: submittedFormData.SAPNumber,
      empTitle: submittedFormData.empTitle,
      department: submittedFormData.department,
      division: submittedFormData.division,
      approvalFrom: getCurrentUserSuperiors()
    }

    // then submit form using submitForm function from crud.js - TODO error handling
    submitForm(formData).then((doc) => {
      res.redirect('/addgoals');
    });
  // if form is invalidly submitted, redirect with error messages to GET /create
  } else {
    res.redirect('/create?errorMessages=%22Invalid%20SAP%20Length%22');
  }
});

app.post('/addgoals', (req, res) => {
  console.log('POST addgoals');
  console.log(reg.body);
  //Add code to handle the array of Objects
})

// GET /approve - display list of forms still requiring approval
app.get('/approve', (req,res) => {
  console.log('GET /approve');
  console.log(req.query);
  // dummy username for now - authentication will be added later
  var userName = 'foobar';
  // fetch array of EPE forms requiring approval from database using crud.js - TODO error handling
  getEPEsFromDB('approve', userName).then((arrayOfForms) => {
    // render approve page with array of forms to be displayed in list
    res.render('approve.hbs', {arrayOfForms});
  });
});

// GET /approve/:id - display form specified by id above list of other forms requiring approval
app.get('/approve/:id', (req,res) => {
  console.log('GET /approve/:id');
  console.log(req.query);
  // dummy username for now - authentication will be added later
  var userName = 'foobar';

  // id is fetched from request
  var id = req.params.id;
  var message = req.query.message;
  // fetch the EPE data from database using ID - TODO error handling
  getEPEById(id).then((epeForm) => {
    // fetch array of EPE forms requiring approval from database using crud.js - TODO error handling
    getEPEsFromDB('approve', userName).then((arrayOfForms) => {
      // render approve page with array of forms to be displayed in list, and id for specific form that was clicked
    res.render('approve.hbs', {arrayOfForms, id, epeForm, message});
    });
  });
});

// GET /archive - display list of archived formsget that no longer require approval
app.get('/archive', (req,res) => {
  console.log('GET /archive');
  console.log(req.query);

  // dummy username for now - authentication will be added later
  var userName = 'foobar';

  // fetch array of archived EPE forms from database using crud.js - TODO error handling
  getEPEsFromDB('archive', userName).then((arrayOfForms) => {
    // render archive page with array of forms to be displayed in list
    res.render('archive.hbs', {arrayOfForms});
  });
});

// GET /archive/:id - display form specified by id above list of other archived forms
app.get('/archive/:id', (req,res) => {
  console.log('GET /archive/:id');
  console.log(req.query);

  // dummy username for now - authentication will be added later
  var userName = 'foobar';

  // id is fetched from request
  var id = req.params.id;

  // fetch the EPE data from database using ID - TODO error handling
  getEPEById(id).then((epeForm) => {
    // fetch array of archived EPE forms from database using crud.js - TODO error handling
    getEPEsFromDB('archive', userName).then((arrayOfForms) => {
      var archivedOn = new Date(epeForm.archivedOn).toDateString();
      // render archive page with array of forms to be displayed in list, and id for specific form that was clicked
      res.render('archive.hbs', {arrayOfForms, id, epeForm, archivedOn});
    });
  });
});

// POST /approve/:id - update form that has been approved by user
app.post('/approve/:id', (req,res) => {
  console.log('PATCH /patch/:id');
  // pick id from request parameters
  var id = req.params.id;
  // pick SAP number of user who approved form from request body
  var body = _.pick(req.body, ['approvedBy']);
var failure = "Approval Failed.";
  // dummy username for now - authentication will be added later
  var user = 'foobar';

  // update id using utility function in crud.js - TODO error handling
  approveEPE(id, body.approvedBy).then((newEpeForm) => {
    // on success, redirect to success page with message indicating which form was approved by which user
    res.redirect(`/approve/${newEpeForm._id}?message=Form%20${newEpeForm._id.toHexString()}%20approved%20by%20SAP%20number%20${body.approvedBy}`);
  }, function() {
      getEPEById(id).then((epeForm) => {
          // fetch array of EPE forms requiring approval from database using crud.js - TODO error handling
          getEPEsFromDB('approve', user).then((arrayOfForms) => {
              // render approve page with array of forms to be displayed in list, and id for specific form that was clicked
              res.render('approve.hbs', {arrayOfForms, id, epeForm, failure});
          });
      });
  })
});

// set up Express app to listen on specified port
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// export Express app object for use in tests - currently no tests set up
module.exports = {app};

/*
ROUTES TO DEFINE
  / routes
    GET /
      if request contains error message, display that above login form
      login form
    POST /
      validate login
      if validated, redirect to home
      else, send GET / request with error message in request

  /home routes
    GET /home
      display buttons for create, approve, archive

  /create routes
    GET /create
      displays form for EPE, with any errors if request contains them

    POST /create
      validates form before entry into database
        if valid, sends to database
        else, send to GET /create with error messages in request

  /approve routes // TODO
    GET /approve/:id
      check if request contains id of EPEForm
        if request contains id, fetch form from database and display it
          below form, have approve button that when clicked, sends PATCH /approve request
        else do nothing

    GET /approve // TODO
      query database for all forms requiring approval from current User
        display list of links in table, with employee name and SAP number
          link sends GET /approve/:id request with id in request

    POST /approve/:id // TODO
      fetch EPEForm that corresponds to id in request from database
        remove current user from approvalFrom array
        check if approvalFrom array is now empty
        if empty, set approvalReq to false

  /archive routes // TODO
    GET /archive/:id
      check if request contains id of EPEform
      if request contains id, fetch form from database and display it
      else do nothing

    GET /archive
      query database for all forms that are archived
      display list of links in table, with employee name and SAP number
        link sends GET /archive/:id request with id in request
*/

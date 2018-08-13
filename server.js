require('./config/config')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const hbs = require('hbs');

var {mongoose} = require('./model/mongoose');
var {EPEForm} = require('./model/schemas/epeform');
var {User} = require('./model/schemas/user');
var {getEPEsFromDB, verifyCredentials, submitForm, getEPEById, getEPEsBySAP, approveEPE, addGoals, addRatings} = require('./model/crud');

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
    verifyCredentials(loginCredentials).then((user) => {
      if(user.length === 1) {
        res.redirect('/home');
      } else {
        res.redirect('/?errorMessage=Invalid%20login%20credentials');
      }
    });
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

  var tempId = null;
  var query = _.pick(req.query, 'SAPnum', 'errorMessage', 'id');
  console.log(query.SAPnum);
  if(query.SAPnum) {
    getEPEsBySAP(query.SAPnum).then((epeForms) => {
      console.log(epeForms.length);
      if(epeForms.length === 0) {
        return res.redirect('/addgoals?errorMessage=EPE%20form%20not%20found');
      }
      
        tempId = epeForms[epeForms.length - 1]._id.toHexString();
        
        return res.redirect('/addgoals?id='+tempId);
      
      
    });
  }
  console.log(tempId);
  if(tempId != null) {
    return res.redirect(`/addgoals?id=${tempId}`);
  }

  if(query.id) {
    return res.render('addgoals.hbs', query);
  }

  if(query.errorMessage) {
    return res.render('addgoals.hbs', query);
  } else {
    return res.render('addgoals.hbs');
  }

});

app.post('/addgoals', (req, res) => {
  console.log('POST /addgoals');
  console.log(req.body);

  id = req.body.shift();

  addGoals(id, req.body).then((newEpeForm) => {
    res.render('success.hbs', {message: 'Goals added to EPE form!'});
  });
});

app.get('/rategoals', (req,res) => {
  console.log('GET /rategoals');
  console.log(req.query);

  var query = _.pick(req.query, 'SAPnum', 'errorMessage', 'id', 'goals');

  if(query.SAPnum) {
    getEPEsBySAP(query.SAPnum).then((epeForms) => {
      if(epeForms.length === 0) {
        return res.redirect('/rategoals?errorMessage=EPE%20form%20not%20found');
      }

      var tempId = epeForms[epeForms.length - 1]._id.toHexString();

      var tempGoals = JSON.stringify(epeForms[epeForms.length - 1].formContent);

      return res.redirect(`/rategoals?id=${tempId}&goals=${encodeURI(tempGoals)}`);
    });
  }

  if(query.id) {
    query.goals = JSON.parse(query.goals);
    return res.render('rategoals.hbs', query);
  }

  if(query.errorMessage) {
    return res.render('rategoals.hbs', query);
  } else {
    return res.render('rategoals.hbs');
  }

});

app.post('/rategoals', (req, res) => {
  console.log('POST /rategoals');
  console.log(req.body);
  var id;
  var ratingPatt = /rating[0-9]/;
  var ratings = {};

  for(var property in req.body) {
    if(ratingPatt.test(property)) {
      ratings[property[6]] = req.body[property];
    } else {
      id = property;
    }
  }

  addRatings(id, ratings).then((newEpeForm) => {
    res.render('success.hbs', {message: 'Ratings added to EPE form!'});
  })
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
      formContent: [],
      approvalFrom: ['123456'],
      approvalRequired: true,
      reportingPeriod: submittedFormData.reportingPeriod,
      dateCreated: new Date().getTime()
    }

    // then submit form using submitForm function from crud.js - TODO error handling
    submitForm(formData).then((doc) => {
      res.redirect('/success?message=%22Form%20created%20successfully!%22');
    });
  // if form is invalidly submitted, redirect with error messages to GET /create
  } else {
    res.redirect('/create?errorMessages=%22Invalid%20SAP%20Length%22');
  }
});

app.post('/addgoals', (req, res) => {
  console.log('POST addgoals');
  console.log(req.body);
  //Add code to handle the array of Objects
});

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

  // pick out SAP number if exists
  var query = _.pick(req.query, ['SAPnum']);

  // if query contains SAP num submitted by user
  if (query.SAPnum) {

    // if user found, query database for EPE forms associated with user
    getEPEsBySAP(query.SAPnum).then((epeForms) => {
      if(epeForms.length === 0) {
        return res.render('archive.hbs', {errorMessage: 'Error: no EPE forms associated with this SAP number'});
      }

      var i;
      var counter = 0;
      var overallAvg = 0;

      for(i = 0; i < epeForms.length; i++) {
        var j;
        var average = 0;
        for(j = 0; j < epeForms[i].formContent.length; j++) {
          overallAvg += epeForms[i].formContent[j].rating;
          average += epeForms[i].formContent[j].rating;
          counter++;
        }
        average = average / j;
        epeForms[i].average = average;
        // epeForms[i].dateCreated = epeForms[i].dateCreated.toDateString();
      }

      overallAvg = overallAvg / counter;

      // if no error, construct object containing data to send to archive.hbs
      var pageData = {
        overallAvg,
        SAPnum: query.SAPnum,
        name: epeForms[0].name,
        epeForms
      }

      console.log(pageData);
      // render archive.hbs with page data
      return res.render('archive.hbs', pageData);
    }).catch((err) => {
      // if some error when finding EPE forms, render archive.hbs with database error message
      return res.render('archive.hbs', {errorMessage: 'Error: server error, contact system administrator'});
    });
  } else {
    // if user did not query search function, then render archive.hbs with no data
    res.render('archive.hbs');
  }
});

// GET /archive/:id - display form specified by id above list of other archived forms
// UNUSED FOR NOW
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

  // update id using utility function in crud.js - TODO error handling
  approveEPE(id, '123456').then((newEpeForm) => {
    // on success, redirect to success page with message indicating which form was approved by which user
    res.redirect(`/success?message=Form%20${newEpeForm._id.toHexString()}%20approved%20by%20SAP%20number%20123456`);
  });
});

// set up Express app to listen on specified port
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// export Express app object for use in tests - currently no tests set up
module.exports = {app};

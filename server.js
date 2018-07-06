require('./config/config')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const hbs = require('hbs');

var {mongoose} = require('./model/mongoose');
var {EPEForm} = require('./model/schemas/epeform');
var {User} = require('./model/schemas/user');
var {getEPEsFromDB, verifyCredentials} = require('./model/crud');

var app = express();
const port = process.env.PORT;

// DUMMY FUNCTIONS FOR now

var getCurrentUserSuperiors = () => {
  return ['64', '234', '653', '123'];
}

var validateForm = (formData) => {
  return (formData.formContent && formData.employeeName && formData.SAPNumber);
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');

app.get('/', (req,res) => {
  console.log('GET /');
  var body = _.pick(req.query, ['errorMessage']);

  res.render('login.hbs', body);
});

app.post('/', (req,res) => {
  console.log('POST /');
  console.log(req.body);
  var loginCredentials = { // fetch login credentials from request
    userName: req.body.userName,
    pass: req.body.password
  }
  if (loginCredentials.userName != "" && loginCredentials.password != "") {

    if (verifyCredentials(loginCredentials)){ // TODO create verifyCredentials method
       res.redirect('/home')
    }  else {
      res.redirect('/?errorMessage=Invalid%20login%20credentials') // TODO configure redirect to contain error message that credentials were not verified
    }
  } else {
    res.redirect('/');
  }
});

app.get('/success', (req,res) => {
  console.log('GET /success');
  var body = _.pick(req.query, ['message']);

  res.render('success.hbs', body);
});

app.get('/error', (req,res) => {
    console.log('GET /error');
  var body = _.pick(req.query, ['message']);

  res.render('error.hbs', body);
});

app.get('/home', (req,res) => {
  console.log('GET /home');
  console.log(req.query);
  res.render('home.hbs'); // TODO create home page
});

app.get('/create', (req,res) => {
  console.log('GET /create');
  console.log(req.query);
  var body = _.pick(req.query, ['errorMessages', 'filledInValues']);

  res.render('create.hbs', body); //TODO create login html/angular page
});

app.post('/create', (req,res) => {
  console.log('POST /create');
  console.log(req.body);
  var formData = _.pick(req.body, ['employeeName', 'SAPNumber', 'formContent']);

  if (validateForm(formData)){
    var newEPEForm = new EPEForm({
      name: formData.employeeName,
      SAPNumber: formData.SAPNumber,
      form: {
        formContent: formData.formContent
      },
      approvalFrom: getCurrentUserSuperiors()
    });

    newEPEForm.save().then((doc) => {
      res.redirect('/success?message=Form%20created%20successfully');
    }, (err) => {
      res.redirect('/error?message=Form%20creation%20unsuccessful');
    });
  } else {
    res.redirect('/create?errorMessages=Invalid%20form%20data&filledInValues=blah');
  }
});

app.get('/approve', (req,res) => {
  console.log('GET /approve');
  console.log(req.query);
  var userName = 'foobar';
  getEPEsFromDB('approve', userName).then((arrayOfForms) => {
    res.render('approve.hbs', {arrayOfForms});
  });
});

app.get('/approve/:id', (req,res) => {
  console.log('GET /approve/:id');
  console.log(req.body);
  var userName = 'foobar';
  var arrayOfFormIds = getEPEsFromDB('approve', userName);

  var id = req.params.id;

  res.render('approve.hbs', {arrayOfFormIds, id});

  // if (!ObjectID.isValid(id)) {
  //   return res.status(404).render('404.html');
  // }
  //
  // EPEForm.findById(id).then((todo) => {
  //   if (!todo){
  //     return res.status(404).render('404.html');
  //   }
  //
  //   res.render('approve.html', {todo});
  // }).catch((err) => {
  //   res.status(400).render('error.html');
  // });
});

app.get('/archive', (req,res) => {
  console.log('GET /archive');
  console.log(req.query);
  var userName = 'foobar';
  getEPEsFromDB('archive', userName).then((arrayOfForms) => {
    res.render('archive.hbs', {arrayOfForms});
  });
});

app.get('/archive/:id', (req,res) => {
  console.log('GET /archive/:id');
  console.log(req.body);
  var userName = 'foobar';
  var arrayOfFormIds = getEPEsFromDB('approve', userName);

  var id = req.params.id;

  res.render('archive.hbs', {arrayOfFormIds, id});

  // if (!ObjectID.isValid(id)) {
  //   return res.status(404).render('404.html');
  // }
  //
  // EPEForm.findById(id).then((todo) => {
  //   if (!todo){
  //     return res.status(404).render('404.html');
  //   }
  //
  //   res.render('approve.html', {todo});
  // }).catch((err) => {
  //   res.status(400).render('error.html');
  // });
});

// app.patch('/approve/:id', (req,res) => {
//   var id = req.params.id;
//   var user = 'foobar';
//
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).render('404.html');
//   }
//
//   EPEForm.findById(id).then((epeForm) => { // TODO finish this method
//     if (!epeForm){
//       return res.status(404).render('404.html');
//     }
//
//     if(epeForm.approvalFrom.includes(user)){
//       newApprovalFrom = epeForm.approvalFrom.remove(user);
//       var body = {
//         approvalFrom = newApprovalFrom,
//         approvalReq = newApprovalFrom.length < 1
//       };
//
//       EPEForm.findByIdAndUpdate(id, {$set: body}, {new: true}).then((newEpe) => {
//         if(!newEpe){
//           return res.status(400).render('error.html');
//         }
//
//         res.send({newEpe}); // TODO redirect to GET /approve
//       }).catch((err) => {
//         res.status(400).render('error.html', err);
//       })
//     } else {
//       throw new Error('You are not required to approve this form');
//     }
//   }).catch((err) => {
//     res.status(400).render('error.html', err);
//   });
// });

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

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

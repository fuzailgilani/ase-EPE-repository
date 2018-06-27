require('./config/config')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const hbs = require('hbs');

var {mongoose} = require('./model/mongoose');
var {EPEForm} = require('./model/schemas/epeform');
var {User} = require('./model/schemas/user');

var app = express();
const port = process.env.PORT;

// DUMMY FUNCTIONS FOR now

var verifyCredentials = (loginCredentials) => {
  return loginCredentials.success === "success";
};

var validateForm = (validForm) => {
  return validForm === 'validate';
};

var getEPEsFromDB = (mode, user) => {
  var dummyArray = [];
  while (dummyArray.length !== 5){
    dummyArray.push({
      id: new ObjectID().toHexString(),
      name: `Bob # ${dummyArray.length+1}`,
      SAPNum: Math.round(Math.random() * 100)
    });
  }
  return dummyArray;
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');

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

app.get('/', (req,res) => {
  console.log('GET /');
  var body = _.pick(req.query, ['errorMessage']);

  res.render('login.hbs', body); //TODO create login html/angular page
});

app.post('/', (req,res) => {
  console.log('POST /');
  console.log(req.body);
  var loginCredentials = { // fetch login credentials from request
    userName: req.body.userName,
    pass: req.body.pass,
    success: req.body.success
  }

  if (verifyCredentials(loginCredentials)){ // TODO create verifyCredentials method
    res.redirect(200, '/home')
  } else {
    res.redirect('/?errorMessage=Invalid%20login%20credentials') // TODO configure redirect to contain error message that credentials were not verified
  }
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
  var validForm = req.body.validOrNot;

  if (validateForm(validForm)){ // TODO create formEntries method
    res.redirect(200, '/home');
  } else {
    res.redirect('/create?errorMessages=Invalid%20form%20data&filledInValues=blah');
  }
});

app.get('/approve', (req,res) => {
  console.log('GET /approve');
  console.log(req.query);
  var userName = 'foobar';
  var arrayOfFormIds = getEPEsFromDB('approve', userName);

  res.render('approve.hbs', {arrayOfFormIds});
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
  var arrayOfFormIds = getEPEsFromDB('archive');

  res.render('archive.hbs', {arrayOfFormIds});
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

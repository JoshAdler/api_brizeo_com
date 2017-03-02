var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase-admin');
var lodash = require('lodash');


var serviceAccount = require("./brizeo-7571c-firebase-adminsdk.json");
//var serviceAccount = require("./fir-test1-7cb44-firebase-adminsdk-4mixq-144aafe9a8.json");
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://brizeo-7571c.firebaseio.com'
//  databaseURL: 'https://fir-test1-7cb44.firebaseio.com/'
});

var db = firebase.database();

var usersRef = db.ref("/User");
var preferencesRef = db.ref("/Preferences");
var momentImagesRef = db.ref("/MomentImages");

//2)	GetCurrentUser (fbid)->user
app.get('/users/:fbid', function(req, res) {
  usersRef.child(req.params.fbid).once("value", function(snapshot) {
    console.log(snapshot.val());
    if (snapshot.exists()) {
      res.send(snapshot.val());
    } else {
      res.send({
        status: 404,
        statusText: "Not Found"
      });
    }
  });
});

//4)	GetPreferencesByUserId or GetCurrentPreferences (userid)->preference
app.get('/preferences/:userid', function(req, res) {
  preferencesRef.child(req.params.userid).once("value", function(snapshot) {
    console.log(snapshot.val());
    if (snapshot.exists()) {
      res.send(snapshot.val());
    } else {
      res.send({
        status: 404,
        statusText: "Not Found"
      });
    }
  });
});

//7)	GetMomentsByUsedId (by default they are sorted 'newest') (userid, [popular, updated], filter)->[moments]
app.get('/moments/:userid/:sort/:filter', function(req, res) {
  var sortstr = "updatedAt";
  if (req.params.sort == "popular") {
    sortstr = "numberOfLikes";
  }
  var filterstr = req.params.sort;

  momentImagesRef.child(req.params.userid).orderByChild(sortstr).once("value", function(snapshot) {
    console.log(snapshot);
    if (snapshot.exists()) {
      var arr = [];
      snapshot.forEach((child) => {
        if (child.momentsPassion == filterstr) arr.push(child.val());
      });
      res.send(arr);
    } else {
      res.send({
        status: 404,
        statusText: "Not Found"
      });
    }
  });
});

//8)	GetAllMoments (we can combine this and the previous method in one)
app.get('/moments/:sort/:filter', function(req, res) {
  var sortstr = "updatedAt";
  if (req.params.sort == "popular") {
    sortstr = "numberOfLikes";
  }
  var filterstr = req.params.sort;

  momentImagesRef.orderByChild(sortstr).once("value", function(snapshot) {
    console.log(snapshot);
    if (snapshot.exists()) {
      var arr = [];
      snapshot.forEach((child) => {
        //if (child.momentsPassion == filterstr)
         arr.push(child.val());
      });
      res.send(arr);
    } else {
      res.send({
        status: 404,
        statusText: "Not Found"
      });
    }
  });
});

//25)	GetCountriesForUser
app.get('/countries/:fbid', function(req, res) {
  usersRef.child(req.params.fbid).once("value", function(snapshot) {
    console.log(snapshot.val());
    if (snapshot.exists()) {
      res.send(snapshot.val().countries);
    } else {
      res.send({
        status: 404,
        statusText: "Not Found"
      });
    }
  });
});









module.exports = app;
var firebase = require('firebase-admin');
var firebasestor = require('firebase');

var serviceAccount = require("./dev_configs/brizeo-development-bf561-firebase-adminsdk-2bzrp-5ccecab264.json");
//var serviceAccount = require("./fir-test1-7cb44-firebase-adminsdk-4mixq-144aafe9a8.json");

//db URL ::: https://brizeo-development-bf561.firebaseio.com/

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://brizeo-development-bf561.firebaseio.com',
  storageBucket: "gs://brizeo-development-bf561.appspot.com"

});

var db = firebase.database();

var usersRef = db.ref("/User");
var searchchild = usersRef.child("2aMOJP6zFh");

var storageRef = firebasestor.storage().ref();

/*searchchild.once("value", function(snapshot) {
  console.log(snapshot.val());
});*/

/*usersRef.push({
  alanisawesome: {
    date_of_birth: "June 23, 1912",
    full_name: "Alan Turing"
  },
  gracehop: {
    date_of_birth: "December 9, 1906",
    full_name: "Grace Hopper"
  }
});*/
/*
  var postData = {
	  alanisawesome: {
		date_of_birth: "June 23, 1912",
		full_name: "Alan Turing"
	  }
  };
  var newPostKey = usersRef.child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  //updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  firebase.database().ref().update(updates);
*/

usersRef.once("value", function(snapshot) {
  console.log(snapshot.val());
});

var firebase = require('firebase-admin');

var serviceAccount = require("./brizeo-7571c-firebase-adminsdk.json");
//var serviceAccount = require("./fir-test1-7cb44-firebase-adminsdk-4mixq-144aafe9a8.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://brizeo-7571c.firebaseio.com'
//  databaseURL: 'https://fir-test1-7cb44.firebaseio.com/'
});

var db = firebase.database();

var usersRef = db.ref("/User");
var searchchild = usersRef.child("2aMOJP6zFh");
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

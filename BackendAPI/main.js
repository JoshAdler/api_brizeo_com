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
var momentImageLikesRef = db.ref("/MomentImages");
var interestsRef = db.ref("/Interests");
var matchRef = db.ref("/Match");

var res200 = {
	status: 200,
	statusText: "OK"
};
var res404 = {
	status: 404,
	statusText: "Not Found"
};
var res500 = {
	status: 500,
	statusText: "Firebase Error"
};

//1) SignIn
app.post('/users', function (req, res) {
	var facebookid = req.body.newusers.facebookid;
	usersRef.child(facebookid).set(req.body.newuser, function (error) {
		if (error) {
			preferencesRef.child(facebookid).set(req.body.newpref, function (error) {
				if (error) {
					res.send(res500);
				} else {
					res.send(res200);
				}
			});
		} else {
			res.send(res500);
		}
	});
});

//2) GetCurrentUser (fbid)->user
app.get('/users/:fbid', function (req, res) {
	usersRef.child(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.send(res404);
		}
	});
});

//4) GetPreferencesByUserId or GetCurrentPreferences (userid)->preference
app.get('/preferences/:fbid', function (req, res) {
	preferencesRef.child(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.send(res404);
		}
	});
});

//5) UpdateUserPreferencesInfo 
app.put('/preferences/:fbid', function (req, res) {
	preferencesRef.child(req.params.fbid).set(req.body.newpref, function (error) {
		if (error) {
			res.send(res500);
		} else {
			res.send(res200);
		}
	});
});

//6) updateUserInfo
app.put('/users/:fbid', function (req, res) {
	usersRef.child(req.params.fbid).set(req.body.newuser, function (error) {
		if (error) {
			res.send(res500);
		} else {
			res.send(res200);
		}
	});
});

//7) GetMomentsByUsedId (by default they are sorted 'newest') (userid, [popular, updated], filter)->[moments]
app.get('/moments/:userid/:sort/:filter', function (req, res) {
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.sort;

	momentImagesRef.child(req.params.userid).orderByChild(sortstr).once("value", function (snapshot) {
		console.log(snapshot);
		if (snapshot.exists()) {
			var arr = [];
			snapshot.forEach((child) => {
				if (child.momentsPassion == filterstr) arr.push(child.val());
			});
			res.send(arr);
		} else {
			res.send(res404);
		}
	});
});

//8) GetAllMoments (we can combine this and the previous method in one)
app.get('/moments/:sort/:filter', function (req, res) {
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.sort;

	momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
		console.log(snapshot);
		if (snapshot.exists()) {
			var arr = [];
			snapshot.forEach((child) => {
				//if (child.momentsPassion == filterstr)
				arr.push(child.val());
			});
			res.send(arr);
		} else {
			res.send(res404);
		}
	});
});

//9) GetAllMoments (we can combine this and the previous method in one)
app.get('/moments/:sort/:filter', function (req, res) {
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.sort;

	momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
		console.log(snapshot);
		if (snapshot.exists()) {
			var arr = [];
			snapshot.forEach((child) => {
				//if (child.momentsPassion == filterstr)
				arr.push(child.val());
			});
			res.send(arr);
		} else {
			res.send(res404);
		}
	});
});

//10) CreateMoment
app.put('/moments', function (req, res) {
	momentImagesRef.push(req.body.newmoment, function (error) {
		if (error) {
			res.send(res500);
		} else {
			res.send(res200);
		}
	});
});

//11) GetAllInterests (It means «travel», «foodie», etc.)
app.get('/interests', function (req, res) {
	interestsRef.once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.send(res404);
		}
	});
});

//16) LikeMoment
app.put('/likemoments/:fbid/:momentid', function (req, res) {
	var likemoment = {
		imageId: req.params.momentid,
		userId: req.params.fbid
	};

	momentImageLikesRef.orderByChild("userId").equalTo(req.params.fbid).once('value', function(snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot, {imageId:req.params.momentid});
			if (curlike.length > 0) {
				res.send(res200);
				return;
			}
		}
	});

	momentImageLikesRef.push(likemoment, function (error) {
		if (error)
			res.send(res500);
		else {
			momentImagesRef.child(req.params.momentid+"/numberOfLikes").once("value", function (snapshot) {
				if (snapshot.exists())
					nol = snapshot.val()++;
				else
					nol = 1;
				momentImagesRef.child(req.params.momentid+"/numberOfLikes").set(nol);
			});
			res.send(res200);
		}
	});

});

//17) unlikeMoment
app.delete('/likemoments/:fbid/:momentid', function (req, res) {
	momentImageLikesRef.orderByChild("userId").equalTo(req.params.fbid).once('value', function(snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot, {imageId:req.params.momentid});
			if (curlike.length == 1)
				momentImageLikesRef.child(curlike[0].objectId).remove();
			else {
				res.send(res200);
				return;
			}
		} else {
			res.send(res200);
			return;
		}
	});

	momentImagesRef.child(req.params.momentid+"/numberOfLikes").once("value", function (snapshot) {
		if (snapshot.exists() && snapshot.val() > 0)
			nol = snapshot.val()--;
		else
			nol = 0;
		momentImagesRef.child(req.params.momentid+"/numberOfLikes").set(nol);
	});
	res.send(res200);
});

//18) DeleteMoment
app.delete('/moments/:fbid/:momentid', function (req, res) {
	momentImagesRef.child(req.params.momentid).remove(function(error) {
		if (error)
			res.send(res404);
		else
			res.send(res200);
	});
});

//19) ReportUser
app.get('/report/:fbid1/:fbid2', function (req, res) {
	//to do : sending mail

});

//20) DownloadEvent
app.get('/downloadevent/:fbid1/:times', function (req, res) {
	//to do : sending mail

});

//21) ApproveMatch
app.post('/match/:fbid1/:fbid2', function (req, res) {
	var appr = {
		userA:req.params.fbid1,
		userB:req.params.fbid2
	};
	matchRef.push(appr, function(error) {
		if (error)
			res.send(res404);
		else
			ress.end(res200);
	});
});

//22) Decline match
app.delete('/approve/:fbid1/:fbid2', function (req, res) {
	matchRef.orderByChild("userA").equalTo(req.params.fbid1).once('value', function(snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot, {userB:req.params.fbid2});
			if (curlike.length == 1) {
				momentImageLikesRef.child(curlike[0].objectId).remove();
				res.send(res200);
				return;
			}
		}
		res.send(res404);
	});
});

//25) GetCountriesForUser
app.get('/countries/:fbid', function (req, res) {
	usersRef.child(req.params.fbid + "/countries").once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.send(res404);
		}
	});
});

//26) AddUserCountriesForUser
app.put('/countries/:fbid', function (req, res) {
	usersRef.child(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			var countries = snapshot.val().countries;
			if (countries == undefined) countries = [];
			if (countries.indexOf(req.body.country) == -1) {
				countries.push(req.body.country);
				usersRef.child(req.params.fbid + "/countries").set(countries, function (error) {
					if (error) {
						res.send(404);
					} else {
						res.send(countries);
					}
				});
			} else {
				res.send(countries);
			}
		} else {
			res.send(res404);
		}
	});
});

//27) DeleteCountryForUser
app.delete('/countries/:fbid', function (req, res) {
	usersRef.child(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			var countries = snapshot.val().countries;
			if (countries == undefined) res.send(404);
			if (countries.indexOf(req.body.country) != -1) {
				countries.splice(countries.indexOf(req.body.country), 1);
				usersRef.child(req.params.fbid + "/countries").set(countries, function (error) {
					if (error) {
						res.send(404);
					} else {
						res.send(countries);
					}
				});
			} else {
				res.send(countries);
			}
		} else {
			res.send(res404);
		}
	});
});









module.exports = app;
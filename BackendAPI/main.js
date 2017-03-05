var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase-admin');
var lodash = require('lodash');
async = require('async');
var nodemailer = require('nodemailer');


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




var smtpTransport = nodemailer.createTransport("SMTP", {  
    service: 'Gmail',
    auth: {
        user: 'joshua.adler1@gmail.com',
        pass: ''
    }
});

var mailOptions = {  
    from: 'Brizeo <saltfactory@gmail.com>',
    to: 'admin@brizeo.com',
    subject: 'Brizeo Notification',
    text: ''
};




var db = firebase.database();

var usersRef = db.ref("/User");
var preferencesRef = db.ref("/Preferences");
var momentImagesRef = db.ref("/MomentImages");
var momentImageLikesRef = db.ref("/MomentImages");
var interestsRef = db.ref("/Interests");
var matchRef = db.ref("/Match");
var notificationRef = db.ref("/Notifications");

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
	statusText: "Server Error"
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
			res.send(res404);
		} else {
			res.send(res200);
		}
	});
});

//6) updateUserInfo
app.put('/users/:fbid', function (req, res) {
	usersRef.child(req.params.fbid).set(req.body.newuser, function (error) {
		if (error) {
			res.send(res404);
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
	var filterstr = req.params.filter;
	momentImagesRef.orderByChild(userId).equalTo(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot);
		if (snapshot.exists()) {
			var moments = snapshot.val();
			if (filterstr != "all")
				moments = lodash.filter(moments, { momentsPassion: filterstr });
			moments = _.sortBy(moments, sortstr);
			res.send(moments);
		} else {
			res.send(res404);
			return;
		}
	});
});

//8) GetAllMoments (we can combine this and the previous method in one)
app.get('/moments/:sort/:filter', function (req, res) {
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.filter;

	if (filterstr != "all") {
		momentImagesRef.orderByChild(sortsmomentsPassion).equalTo(req.params.filterstr).once("value", function (snapshot) {
			console.log(snapshot);
			if (snapshot.exists()) {
				var moments = _.sortBy(snapshot.val(), sortstr);
				res.send(moments);
			} else {
				res.send(res404);
			}
		});
	} else {
		momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
			console.log(snapshot);
			if (snapshot.exists()) {
				res.send(snapshot.val());
			} else {
				res.send(res404);
			}
		});
	}
});

//9) GetMatchedMomentsByUserId
app.get('/matchedmoments/:userid/:sort/:filter', function (req, res) {
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.sort;

	momentImageLikesRef.orderByChild(userId).equalTo(req.params.userid).once("value", function(snapshot) {
			var arymoments = [];
			async.forEach(snapshot.val(), function (matchrow, callback) {
				momentImagesRef.child(matchrow.imageId).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) arymoments.push(snapshot.val());
					callback();
				});
			}, function (err) {
				if (filterstr != "all")
					moments = lodash.filter(arymoments, { momentsPassion: filterstr });
				arymoments = _.sortBy(arymoments, sortstr);
				res.send(arymoments);
			});

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

//12) GetLikersForMomentByMomentId 
app.get('/likemoments/users/:momentid', function (req, res) {
	momentImageLikesRef.orderByChild("imageId").equalTo(req.params.momnetid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			// var arr = [];
			// snapshot.forEach(function(child) {
			// 	arr.push(child.val().userId);
			// });
			var aryuser = [];
			async.forEach(snapshot.val(), function (likerrow, callback) {
				usersRef.child(likerrow.userId).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) aryuser.push(snapshot.val());
					callback();
				});
			}, function (err) {
				res.json(aryuser);
			});
		} else
			res.send(res404);
	});
});

//13) ReportMoment
app.post('/reportmoment/:momentid/:userid', function (req, res) {
	mailOptions.text = "Moment Reported";

	smtpTransport.sendMail(mailOptions, function(error, response){
		if (error){
			console.log(error);
      res.sned(res500);
		} else {
			console.log("Message sent : " + response.message);
      res.sned(res200);
		}
		smtpTransport.close();
	});
});

//14) GetNotificationsForUserId
app.get('/notifications/:fbid', function (req, res) {
	notificationRef.orderByChild("receiveUser").equalTo(req.params.fbid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else 
			res.send(res404);
	});

});

//15) GetUser
app.get('/notifications/:fbid1/:fbid2', function (req, res) {
	notificationRef.orderByChild("receiveUser").equalTo(req.params.fbid1).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { sendUser: req.params.fbid2 });
			if (curlike.length > 0) {
				usersRef.child(req.params.fbid2).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) {
						res.send(snapshot.val());
					} else {
						res.send(res404);
					}
				});				
				return;
			} else
				res.send(res404);
		} else 
			res.send(res404);
	});
});

//16) LikeMoment
app.put('/likemoments/:fbid/:momentid', function (req, res) {
	var likemoment = {
		imageId: req.params.momentid,
		userId: req.params.fbid
	};

	momentImageLikesRef.orderByChild("userId").equalTo(req.params.fbid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { imageId: req.params.momentid });
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
			momentImagesRef.child(req.params.momentid + "/numberOfLikes").once("value", function (snapshot) {
				if (snapshot.exists())
					nol = snapshot.val()++;
				else
					nol = 1;
				momentImagesRef.child(req.params.momentid + "/numberOfLikes").set(nol);
			});
			res.send(res200);
		}
	});

});

//17) unlikeMoment
app.delete('/likemoments/:fbid/:momentid', function (req, res) {
	momentImageLikesRef.orderByChild("userId").equalTo(req.params.fbid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { imageId: req.params.momentid });
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

	momentImagesRef.child(req.params.momentid + "/numberOfLikes").once("value", function (snapshot) {
		if (snapshot.exists() && snapshot.val() > 0)
			nol = snapshot.val()--;
		else
			nol = 0;
		momentImagesRef.child(req.params.momentid + "/numberOfLikes").set(nol);
	});
	res.send(res200);
});

//18) DeleteMoment
app.delete('/moments/:fbid/:momentid', function (req, res) {
	momentImagesRef.child(req.params.momentid).remove(function (error) {
		if (error)
			res.send(res404);
		else
			res.send(res200);
	});
});

//19) ReportUser
app.post('/reportuser/:fbid1/:fbid2', function (req, res) {
	//to do : sending mail
	mailOptions.text = "User Reported";

	smtpTransport.sendMail(mailOptions, function(error, response){
		if (error){
			console.log(error);
      res.send(res500);
		} else {
			console.log("Message sent : " + response.message);
      res.sned(res200);
		}
		smtpTransport.close();
	});
});

//20) DownloadEvent
app.post('/downloadevent/:fbid1/:times', function (req, res) {
	//to do : sending mail
	mailOptions.text = "DownloadEvent";

	smtpTransport.sendMail(mailOptions, function(error, response){
		if (error){
			console.log(error);
      res.sned(res500);
		} else {
			console.log("Message sent : " + response.message);
      res.send(res200);
		}
		smtpTransport.close();
	});
});

//21) ApproveMatch
app.post('/match/:fbid1/:fbid2', function (req, res) {
	var appr = {
		userA: req.params.fbid1,
		userB: req.params.fbid2
	};
	matchRef.push(appr, function (error) {
		if (error)
			res.send(res404);
		else
			ress.end(res200);
	});
});

//22) Decline match
app.delete('/match/:fbid1/:fbid2', function (req, res) {
	matchRef.orderByChild("userA").equalTo(req.params.fbid1).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { userB: req.params.fbid2 });
			if (curlike.length == 1) {
				matchRef.child(curlike[0].objectId).remove();
				res.send(res200);
				return;
			}
		}
		res.send(res404);
	});
});

//23) GetUsersForMatch
app.get('/approveuserformatch/:fbid', function (req, res) {
	matchRef.orderByChild("userA").equalTo(req.params.fbid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var aryuser = [];
			async.forEach(snapshot.val(), function (matchrow, callback) {
				usersRef.child(likerrow.userB).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) aryuser.push(snapshot.val());
					callback();
				});
			}, function (err) {
				res.json(aryuser);
			});
		} else
			res.send(res404);
	});
});

//24) GetMatchesForUser
app.get('/approvematchforuser/:fbid', function (req, res) {
	matchRef.orderByChild("userB").equalTo(req.params.fbid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var aryuser = [];
			async.forEach(snapshot.val(), function (matchrow, callback) {
				usersRef.child(likerrow.userA).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) aryuser.push(snapshot.val());
					callback();
				});
			}, function (err) {
				res.json(aryuser);
			});
		} else
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
						res.send(res500);
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
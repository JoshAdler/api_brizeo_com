var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase-admin');
var lodash = require('lodash');
async = require('async');
var nodemailer = require('nodemailer');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var fs = require('fs');




var serviceAccount = require("./brizeo-7571c-firebase-adminsdk.json");
//var serviceAccount = require("./fir-test1-7cb44-firebase-adminsdk-4mixq-144aafe9a8.json");
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: 'https://brizeo-7571c.firebaseio.com'
//	databaseURL: 'https://fir-test1-7cb44.firebaseio.com/'
});





var gcs = require('@google-cloud/storage')({
    projectId: "brizeo-7571c",
    keyFilename: './brizeo-7571c-firebase-adminsdk.json',
});

var bucket = gcs.bucket('brizeo-7571c.appspot.com')




var smtpTransport = nodemailer.createTransport({  
    service: "Gmail",
    auth: {
        user: 'brizeoapp@gmail.com',
        pass: 'Zulick1836!'
    }
});

var mailOptions = {  
    from: 'Brizeo Notification',
    to: 'admin@brizeo.com',
    subject: 'Brizeo Notification',
    text: ''
};




var db = firebase.database();

var usersRef = db.ref("/User");
var preferencesRef = db.ref("/Preferences");
var momentImagesRef = db.ref("/MomentImages");
var momentImageLikesRef = db.ref("/MomentImageLikes");
var passionsRef = db.ref("/Passions");
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

var newpref = {
  genders : ["male", "female"],
  passions : ["yNtHTBEGAw"],
  lowerAgeLimit: 18,
  upperAgeLimit: 85,
  maxSearchDistance: 100
};

//1) SignIn
app.post('/users', function (req, res) {
	console.log("----------------API------01------------");
	var newuserref = usersRef.push();
	var newuser = req.body.newuser;
	newuser.objectId = newuserref.key;
	newuserref.set(newuser);
	console.log(newuserref);
	preferencesRef.child(newuserref.key).set(newpref, function (error) {
		if (error) {
			res.send(res500);
		} else {
			res.send(newuserref.key);
		}
	});
});

//2) GetCurrentUser (userid)->user
app.get('/users/:fbid', function (req, res) {
	console.log("----------------API------02------------");
	usersRef.orderByChild("facebookId").equalTo(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			for(key in snapshot.val()) {
				res.send(snapshot.val()[key]);
				return;
			}
		} else {
			res.status(500).end();
		}
	});
});

//3) UploadFilesForUser (It may be images or videos)
app.post('/upload/:userid', upload.array('uploadFile'), function(req, res){
	console.log("----------------API------03------------");
    var upFile = req.files;
	console.log(upFile);

//    var dirname = __dirname.split('\\');
	var count = 0;
	for (var i = 0; i < upFile.length; i++) {
		if(fs.statSync(__dirname + "\\" + upFile[i].path).isFile()){ //fs 모듈을 사용해서 파일의 존재 여부를 확인한다.
			dotdeli = upFile[i].originalname.split('.').length;
			var exten = "";
			if (dotdeli > 1) {
				exten = upFile[i].originalname.split('.')[dotdeli - 1];
				console.log(upFile[i].originalname.split('.'));
				console.log(exten);
			}
			var newname = __dirname + "\\" + upFile[i].path + "." + exten;
			fs.rename(__dirname + "\\" + upFile[i].path, newname);
			bucket.upload(newname, function(err, file) {
				if (err) {
					console.log("bucket upload error");
					console.log(err);
				} else
					console.log("bucket upload success");
			});
			res.send(res200);
		};
	}
});

//4) GetPreferencesByUserId or GetCurrentPreferences (userid)->preference
app.get('/preferences/:userid', function (req, res) {
	console.log("----------------API------04------------");
	preferencesRef.child(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			preferencesRef.child(userid).set(newpref, function (error) {
				if (error) {
					res.send(res500);
				} else {
					res.send(newpref);
				}
			});
		}
	});
});

//5) UpdateUserPreferencesInfo 
app.put('/preferences/:userid', function (req, res) {
	console.log("----------------API------05------------");
	preferencesRef.child(req.params.userid).set(req.body.newpref, function (error) {
		if (error) {
			res.send(res404);
		} else {
			res.send(res200);
		}
	});
});

//6) updateUserInfo
app.put('/users/:userid', function (req, res) {
	console.log("----------------API------06------------");
	usersRef.child(req.params.userid).set(req.body.newuser, function (error) {
		if (error) {
			res.send(res404);
		} else {
			res.send(res200);
		}
	});
});

//7) GetMomentsByUsedId (by default they are sorted 'newest') (userid, [popular, updated], filter)->[moments]
app.get('/moments/:userid/:sort/:filter', function (req, res) {
	console.log("----------------API------07------------");
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.filter;
	momentImagesRef.orderByChild("userId").equalTo(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot.val());
		var moments = [];
		if (snapshot.exists()) {
			moments = snapshot.val();
			if (filterstr != "all")
				moments = lodash.filter(moments, { momentsPassion: filterstr });
			moments = lodash.sortBy(moments, sortstr);
			res.send(moments);
		} else {
			res.send(moments);
			return;
		}
	});
});

//8) GetAllMoments (we can combine this and the previous method in one)
app.get('/moments/:sort/:filter', function (req, res) {
	console.log("----------------API------08------------");
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.filter;
	var moments = [];

	if (filterstr != "all") {
		momentImagesRef.orderByChild("momentsPassion").equalTo(filterstr).once("value", function (snapshot) {
			console.log(snapshot);
			if (snapshot.exists()) {
				moments = lodash.sortBy(snapshot.val(), sortstr);
				res.send(moments);
			} else {
				res.send(moments);
			}
		});
	} else {
		momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
			console.log(snapshot);
			if (snapshot.exists()) {
				moments = lodash.sortBy(snapshot.val(), sortstr);
				res.send(moments);
			} else {
				res.send(moments);
			}
		});
	}
});

//9) GetMatchedMomentsByUserId
app.get('/matchedmoments/:userid/:sort/:filter', function (req, res) {
	console.log("----------------API------09------------");
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.sort;

	momentImageLikesRef.orderByChild("userId").equalTo(req.params.userid).once("value", function(snapshot) {
			var arymoments = [];
			console.log(snapshot.val());
			async.forEach(snapshot.val(), function (matchrow, callback) {
				console.log("----matchro---------", matchrow);
				momentImagesRef.child(matchrow.imageId).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) arymoments.push(snapshot.val());
					callback();
				});
			}, function (err) {
				if (filterstr != "all")
					moments = lodash.filter(arymoments, { momentsPassion: filterstr });
				arymoments = lodash.sortBy(arymoments, sortstr);
				res.send(arymoments);
			});

	});
});

//10) CreateMoment
app.put('/moments', function (req, res) {
	console.log("----------------API------10------------");
	momentImagesRef.push(req.body.newmoment, function (error) {
		if (error) {
			res.send(res500);
		} else {
			res.send(res200);
		}
	});
});

//11) GetAllInterests (It means «travel», «foodie», etc.)
app.get('/passions', function (req, res) {
	console.log("----------------API------11------------");
	passionsRef.once("value", function (snapshot) {
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
	console.log("----------------API------12------------");
	var aryuser = [];
	momentImageLikesRef.orderByChild("imageId").equalTo(req.params.momentid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			// var arr = [];
			// snapshot.forEach(function(child) {
			// 	arr.push(child.val().userId);
			// });
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
			res.send(aryuser);
	});
});

//13) ReportMoment
app.post('/reportmoment/:momentid/:userid', function (req, res) {
	console.log("----------------API------13------------");
	mailOptions.text = "Moment Reported";

	smtpTransport.sendMail(mailOptions, function(error, response){
		if (error){
			console.log(error);
			res.send(res500);
		} else {
			console.log("Message sent : ", response.response);
			res.send(res200);
		}
		smtpTransport.close();
	});
});

//14) GetNotificationsForUserId
app.get('/notifications/:userid', function (req, res) {
	console.log("----------------API------14------------");
	notificationRef.orderByChild("receiveUser").equalTo(req.params.userid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else 
			res.send([]);
	});

});

//15) GetUser
app.get('/notifications/:userid1/:userid2', function (req, res) {
	console.log("----------------API------15------------");
	notificationRef.orderByChild("receiveUser").equalTo(req.params.userid1).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { sendUser: req.params.userid2 });
			if (curlike.length > 0) {
				usersRef.child(req.params.userid2).once("value", function (snapshot) {
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
app.put('/likemoments/:userid/:momentid', function (req, res) {
	console.log("----------------API------16------------");
	var likemoment = {
		imageId: req.params.momentid,
		userId: req.params.userid
	};

	momentImageLikesRef.orderByChild("userId").equalTo(req.params.userid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { imageId: req.params.momentid });
			if (curlike.length > 0) {
				console.log("-----------curlike--------", curlike, "------------------------");
				momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists())
						res.send(snapshot.val());
					else
						res.send(res404);
				});
				return;
			}
		}
		tmpref = momentImageLikesRef.push();
		likemoment.objectId = tmpref.key;
		tmpref.set(likemoment, function (error) {
			if (error)
				res.send(res500);
			else {
				momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
					if (snapshot.exists()) {
						moment = snapshot.val();
						if (Object.keys(moment).indexOf("likedBycurrentUser") == -1) {
							moment.likedBycurrentUser = [];
						}
						moment.numberOfLikes = moment.numberOfLikes + 1;
						moment.likedBycurrentUser.push(req.params.userid);
						momentImagesRef.child(req.params.momentid).set(moment);
						res.send(moment);
					} else
						res.send(res404);
				});
			}
		});

	});
});

//17) unlikeMoment
app.delete('/likemoments/:userid/:momentid', function (req, res) {
	console.log("----------------API------17------------");
	momentImageLikesRef.orderByChild("userId").equalTo(req.params.userid).once('value', function (snapshot) {
		if (snapshot.exists()) {
			console.log("----------------snapshot.val-----------", snapshot.val(), "--------------");
			var curlike = lodash.filter(snapshot.val(), { imageId: req.params.momentid });
			console.log("----------curlike-------", curlike, "----------------");
			if (curlike.length == 1) {
				momentImageLikesRef.child(curlike[0].objectId).remove();
				momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
					if (snapshot.exists()) {
						moment = snapshot.val();
						if (Object.keys(moment).indexOf("likedBycurrentUser") == -1) {
							moment.likedBycurrentUser = [];
						}
						if (moment.numberOfLikes > 0) moment.numberOfLikes = moment.numberOfLikes - 1;
						moment.likedBycurrentUser.splice(moment.likedBycurrentUser.indexOf(req.params.userid), 1);
						momentImagesRef.child(req.params.momentid).set(moment);
						res.send(moment);
					} else
						res.send(res404);
				});
			} else {
				res.send(res404);
				return;
			}
		} else {
			res.send(res404);
			return;
		}
	});

});

//18) DeleteMoment
app.delete('/moments/:userid/:momentid', function (req, res) {
	console.log("----------------API------18------------");
	momentImagesRef.child(req.params.momentid).remove(function (error) {
		if (error)
			res.send(res404);
		else
			res.send(res200);
	});
});

//19) ReportUser
app.post('/reportuser/:userid1/:userid2', function (req, res) {
	//to do : sending mail
	console.log("----------------API------19------------");
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
app.post('/downloadevent/:userid1/:times', function (req, res) {
	//to do : sending mail
	console.log("----------------API------20------------");
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
app.post('/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------21------------");
	var appr = {
		userA: req.params.userid1,
		userB: req.params.userid2
	};
	matchRef.push(appr, function (error) {
		if (error)
			res.send(res404);
		else
			ress.end(res200);
	});
});

//22) Decline match
app.delete('/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------22------------");
	matchRef.orderByChild("userA").equalTo(req.params.userid1).once('value', function (snapshot) {
		if (snapshot.exists()) {
			var curlike = lodash.filter(snapshot.val(), { userB: req.params.userid2 });
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
app.get('/approveuserformatch/:userid', function (req, res) {
	console.log("----------------API------23------------");
	matchRef.orderByChild("userA").equalTo(req.params.userid).once('value', function (snapshot) {
		var aryuser = [];
		if (snapshot.exists()) {
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
			res.send(aryuser);
	});
});

//24) GetMatchesForUser
app.get('/approvematchforuser/:userid', function (req, res) {
	console.log("----------------API------24------------");
	matchRef.orderByChild("userB").equalTo(req.params.userid).once('value', function (snapshot) {
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
app.get('/countries/:userid', function (req, res) {
	console.log("----------------API------25------------");
	usersRef.child(req.params.userid + "/countries").once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.send(res404);
		}
	});
});

//26) AddUserCountriesForUser
app.put('/countries/:userid', function (req, res) {
	console.log("----------------API------26------------");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			var countries = snapshot.val().countries;
			if (countries == undefined) countries = [];
			if (countries.indexOf(req.body.country) == -1) {
				countries.push(req.body.country);
				usersRef.child(req.params.userid + "/countries").set(countries, function (error) {
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
app.delete('/countries/:userid', function (req, res) {
	console.log("----------------API------27------------");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			var countries = snapshot.val().countries;
			if (countries == undefined) res.send(404);
			if (countries.indexOf(req.body.country) != -1) {
				countries.splice(countries.indexOf(req.body.country), 1);
				usersRef.child(req.params.userid + "/countries").set(countries, function (error) {
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
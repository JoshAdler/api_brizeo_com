var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase-admin');
var lodash = require('lodash');
async = require('async');
var nodemailer = require('nodemailer');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
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

var bucket = gcs.bucket('brizeo-7571c.appspot.com');



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
	genders: ["male", "female"],
	passions: ["yNtHTBEGAw"],
	lowerAgeLimit: 18,
	upperAgeLimit: 85,
	maxSearchDistance: 100
};

//1) SignIn
app.post('/users', upload.array('mainUploadFile'), upload.array('otherUploadFile'), function (req, res) {
	console.log("----------------API------01------------");
	var newuserref = usersRef.push();
	var newuser = req.body.newuser;
	newuser.objectId = newuserref.key;
	newuserref.set(newuser, function (error) {
		if (error) {
			res.status(500).end();
		} else {
			preferencesRef.child(newuserref.key).set(newpref, function (error) {
				if (error) {
					res.status(500).end();
				} else {
					res.status(200).end();
				}
			});
		}

	});
	console.log(newuserref);
	var upFile = req.files;
	console.log(req.files);
	console.log(upFile);
	/*
		async.forEach(snapshot.val(), function (likerrow, callback) {
			usersRef.child(likerrow.userId).once("value", function (snapshot) {
				console.log(snapshot.val());
				if (snapshot.exists()) aryuser.push(snapshot.val());
				callback();
			});
		}, function (err) {
			res.json(aryuser);
		});
	*/
	//    var dirname = __dirname.split('\\');
	/*
		for (var i = 0; i < upFile.length; i++) {
			if(fs.statSync(__dirname + "\\" + upFile[i].path).isFile()){
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
					} else
						console.log("bucket upload success");
						console.log(file.name);
						console.log(file.cloudStoragePublicUrl);
						console.log(file.metadata.selfLink);
				});
	
			};
		}
	*/
});

//2) GetCurrentUser (userid)->user
app.get('/users/:fbid', function (req, res) {
	console.log("----------------API------02------------");
	usersRef.orderByChild("facebookId").equalTo(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			for (key in snapshot.val()) {
				res.send(snapshot.val()[key]);
				return;
			}
		} else {
			res.status(404).end();
		}
	});
});

//3) UploadFilesForUser (It may be images or videos)
app.post('/upload/:userid', upload.array('uploadFile'), function (req, res) {
	console.log("----------------API------03------------");
	var upFile = req.files;
	console.log(req.files);
	console.log(upFile);

	//    var dirname = __dirname.split('\\');
	for (var i = 0; i < upFile.length; i++) {
		if (fs.statSync(__dirname + "\\" + upFile[i].path).isFile()) {
			dotdeli = upFile[i].originalname.split('.').length;
			var exten = "";
			if (dotdeli > 1) {
				exten = upFile[i].originalname.split('.')[dotdeli - 1];
				console.log(upFile[i].originalname.split('.'));
				console.log(exten);
			}
			var newname = __dirname + "\\" + upFile[i].path + "." + exten;
			fs.rename(__dirname + "\\" + upFile[i].path, newname);
			bucket.upload(newname, function (err, file) {
				if (err) {
					console.log("bucket upload error");
					res.status(500).end();
				} else {
					console.log("bucket upload success");
					file.makePublic().then(function (data) {
						usersRef.child(req.params.userid).once("value", function (snapshot) {
							if (snapshot.exists()) {
								var curuserdata = snapshot.val();
								var userdata = {};
								userdata.otherProfileImages = [];
								if (curuserdata.hasOwnProperty("otherProfileImages"))
									userdata.otherProfileImages = curuserdata.otherProfileImages;
								userdata.otherProfileImages.push("https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name);
								usersRef.child(req.params.userid).update(userdata);
							}
							res.status(200).end();
						});
					});
				}
			});
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
			preferencesRef.child(req.params.userid).set(newpref, function (error) {
				if (error) {
					res.status(500).end();
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
			res.status(404).end();
		} else {
			res.status(200).end();
		}
	});
});

//6) updateUserInfo
app.put('/users/:userid', function (req, res) {
	console.log("----------------API------06------------");
	usersRef.child(req.params.userid).set(req.body.newuser, function (error) {
		if (error) {
			res.status(404).end();
		} else {
			res.status(200).end();
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

			async.forEach(moments, function (moment, callback) {
				console.log("----moment---------", moment);
				usersRef.child(moment.userId).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) moment.user = snapshot.val();
					callback();
				});
			}, function (err) {
				res.send(moments);
			});
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
			if (snapshot.exists())
				moments = lodash.sortBy(snapshot.val(), sortstr);

			async.forEach(moments, function (moment, callback) {
				if (moment.hasOwnProperty("userId")) {
					usersRef.child(moment.userId).once("value", function (snapshot) {
						console.log(snapshot.val());
						if (snapshot.exists()) moment.user = snapshot.val();
						callback();
					});
				} else
					callback();
			}, function (err) {
				res.send(moments);
			});
		});
	} else {
		momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
			if (snapshot.exists()) {
				snapshot.forEach(function (moment) {
					moments.push(moment.val());
				});
				async.forEach(moments, function (moment, callback) {
					console.log("----moment---------", moment);
					if (moment.hasOwnProperty("userId")) {
						usersRef.child(moment.userId).once("value", function (snapshot) {
							console.log(snapshot.val());
							if (snapshot.exists()) moment.user = snapshot.val();
							callback();
						});
					} else
						callback();
				}, function (err) {
					res.send(moments);
				});
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
	var filterstr = req.params.filter;

	momentImageLikesRef.orderByChild("userId").equalTo(req.params.userid).once("value", function (snapshot) {
		var arymoments = [];
		console.log(snapshot.val());
		async.forEach(snapshot.val(), function (matchrow, callback) {
			console.log("----matchro---------", matchrow);
			momentImagesRef.child(matchrow.imageId).once("value", function (snapshot) {
				console.log("----------momentimagesref-----------", snapshot.val());
				if (snapshot.exists()) arymoments.push(snapshot.val());
				callback();
			});
		}, function (err) {
			if (filterstr != "all")
				arymoments = lodash.filter(arymoments, { momentsPassion: filterstr });
			console.log(arymoments);
			arymoments = lodash.sortBy(arymoments, sortstr);
			async.forEach(arymoments, function (moment, callback) {
				console.log("----moment---------", moment);
				if (moment.hasOwnProperty("userId")) {
					usersRef.child(moment.userId).once("value", function (snapshot) {
						console.log(snapshot.val());
						if (snapshot.exists()) moment.user = snapshot.val();
						callback();
					});
				} else
					callback();
			}, function (err) {
				res.send(arymoments);
			});
		});

	});
});

//10) CreateMoment
app.put('/moments', upload.single('uploadFile'), function (req, res) {
	console.log("----------------API------10------------");
	var upFile = req.file;
	if (upFile == undefined) {
		res.sendStatus(500);
		return;
	}

	if (fs.statSync(__dirname + "\\" + upFile.path).isFile()) {
		dotdeli = upFile.originalname.split('.').length;
		var exten = "";
		if (dotdeli > 1) {
			exten = upFile.originalname.split('.')[dotdeli - 1];
		}
		var newname = __dirname + "\\" + upFile.path + "." + exten;
		fs.rename(__dirname + "\\" + upFile.path, newname);
		bucket.upload(newname, function (err, file) {
			if (err) {
				console.log("bucket upload error");
				console.log(err);
			} else {
				console.log("bucket upload success");
				var newmoment = req.body.newmoment;

				file.makePublic().then(function (data) {
					newmoment = req.body.newmoment;
					newmoment.momentUploadImages = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name;
					newmomentref = momentImagesRef.push();
					newmomentref.set(newmoment, function (error) {
						if (error) {
							res.status(500).end();
						} else {
							res.send(newmomentref.key);
						}
					});
				});
			}
		});
		res.status(200).end();
	};
});

//11) GetAllInterests (It means «travel», «foodie», etc.)
app.get('/passions', function (req, res) {
	console.log("----------------API------11------------");
	passionsRef.once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.status(404).end();
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

	smtpTransport.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log(error);
			res.status(500).end();
		} else {
			console.log("Message sent : ", response.response);
			res.status(200).end();
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

var getUserStatus = function (userid1, userid2) {
	return new Promise(function(resolve, reject) {
			var matches = [];
			matchRef.orderByChild("userA").equalTo(userid1).once('value', function (snapshot) {
			if (snapshot.exists()) {
				snapshot.forEach(function (match) {
					matches.push(match);
					//matches.push(match);
				});
				var curlike = lodash.filter(matches, (match) => {
					return match.val().userB === userid2;
				});
				if (curlike.length == 1) {
					resolve(curlike[0].val().status);
				}
			}
			resolve(-1);
		});
	});
}

//15) GetUser
app.get('/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------15------------");
	getUserStatus(req.params.userid1, req.params.userid2).then(function(status) {
		status1 = status;
		getUserStatus(req.params.userid2, req.params.userid1).then(function(status) {
			status2 = status;
			console.log("------status1--", status1, "-----status2---", status2, "------------");
			if (status1 == -1 && status2 == -1)
				res.send(1);
			else if (status == 1 && status2 == 1)
				res.send(7);

		});
	});



	// var matches = [];
	// matchRef.orderByChild("userA").equalTo(req.params.userid1).once('value', function (snapshot) {
	// 	if (snapshot.exists()) {
	// 		snapshot.forEach(function (match) {
	// 			matches.push(match);
	// 			//matches.push(match);
	// 		});
	// 		var curlike = lodash.filter(matches, (match) => {
	// 			return match.val().userB === req.params.userid2;
	// 		});
	// 		if (curlike.length == 1) {
	// 			console.log("------status--------", curlike[0].val().status);

	// 			return;
	// 		}
	// 	} else {
	// 		matchRef.orderByChild("userA").equalTo(req.params.userid2).once('value', function (snapshot) {
	// 			if (snapshot.exists()) {
	// 				snapshot.forEach(function (match) {
	// 					console.log(match.ref);
	// 					console.log(match);
	// 					matches.push(match);
	// 					//matches.push(match);
	// 				});
	// 				var curlike = lodash.filter(matches, (match) => {
	// 					return match.val().userB === req.params.userid2;
	// 				});
	// 				console.log(curlike);
	// 				if (curlike.length == 1) {
	// 					curlike[0].ref.set(appr);
	// 					res.status(200).end();
	// 					return;
	// 				}
	// 			}
	// 		});
	// 	}


	// });














	// notificationRef.orderByChild("receiveUser").equalTo(req.params.userid1).once('value', function (snapshot) {
	// 	console.log(snapshot.val());
	// 	if (snapshot.exists()) {
	// 		var curlike = lodash.filter(snapshot.val(), { sendUser: req.params.userid2 });
	// 		if (curlike.length > 0) {
	// 			usersRef.child(req.params.userid2).once("value", function (snapshot) {
	// 				console.log(snapshot.val());
	// 				if (snapshot.exists()) {
	// 					res.send(snapshot.val());
	// 				} else {
	// 					res.status(404).end();
	// 				}
	// 			});
	// 			return;
	// 		} else
	// 			res.status(404).end();
	// 	} else
	// 		res.status(404).end();
	// });
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
						res.status(404).end();
				});
				return;
			}
		}
		tmpref = momentImageLikesRef.push();
		likemoment.objectId = tmpref.key;
		tmpref.set(likemoment, function (error) {
			if (error)
				res.status(500).end();
			else {
				momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
					if (snapshot.exists()) {
						moment = snapshot.val();
						if (!moment.hasOwnProperty("likedBycurrentUser"))
							moment.likedBycurrentUser = [];
						moment.numberOfLikes = moment.numberOfLikes + 1;
						moment.likedBycurrentUser.push(req.params.userid);
						momentImagesRef.child(req.params.momentid).set(moment);
						res.send(moment);
					} else
						res.status(404).end();
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
						if (moment.hasOwnProperty("likedBycurrentUser") == -1)
							moment.likedBycurrentUser = [];
						if (moment.numberOfLikes > 0) moment.numberOfLikes = moment.numberOfLikes - 1;
						moment.likedBycurrentUser.splice(moment.likedBycurrentUser.indexOf(req.params.userid), 1);
						momentImagesRef.child(req.params.momentid).set(moment);
						res.send(moment);
					} else
						res.status(404).end();
				});
			} else {
				res.status(404).end();
				return;
			}
		} else {
			res.status(404).end();
			return;
		}
	});

});

//18) DeleteMoment
app.delete('/moments/:userid/:momentid', function (req, res) {
	console.log("----------------API------18------------");
	momentImagesRef.child(req.params.momentid).remove(function (error) {
		if (error)
			res.status(404).end();
		else
			res.status(200).end();
	});
});

//19) ReportUser
app.post('/reportuser/:userid1/:userid2', function (req, res) {
	//to do : sending mail
	console.log("----------------API------19------------");
	mailOptions.text = "User Reported";

	smtpTransport.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log(error);
			res.status(500).end();
		} else {
			console.log("Message sent : " + response.message);
			res.snedStatus(200);
		}
		smtpTransport.close();
	});
});

//20) DownloadEvent
app.post('/downloadevent/:userid1/:times', function (req, res) {
	//to do : sending mail
	console.log("----------------API------20------------");
	mailOptions.text = "DownloadEvent";

	smtpTransport.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log(error);
			res.sendStatus(500);
		} else {
			console.log("Message sent : " + response.message);
			res.status(200).end();
		}
		smtpTransport.close();
	});
});


var likeunlikeMatch = function (req, res, status) {
	var appr = {
		userA: req.params.userid1,
		userB: req.params.userid2,
		status: status
	};

	var matches = [];
	matchRef.orderByChild("userA").equalTo(req.params.userid1).once('value', function (snapshot) {
		if (snapshot.exists()) {
			snapshot.forEach(function (match) {
				console.log(match.ref);
				console.log(match);
				matches.push(match);
				//matches.push(match);
			});
			var curlike = lodash.filter(matches, (match) => {
				return match.val().userB === req.params.userid2;
			});
			console.log(curlike);
			if (curlike.length == 1) {
				curlike[0].ref.set(appr);
				res.status(200).end();
				return;
			}
		}

		matchRef.push(appr, function (error) {
			if (error)
				res.status(404).end();
			else
				res.sendStatus(200);
		});
	});
}
//21) ApproveMatch
app.post('/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------21------------");
	likeunlikeMatch(req, res, 1);
});

//22) Decline match
app.delete('/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------22------------");
	likeunlikeMatch(req, res, 0);
});

//23) GetUsersForMatch
app.get('/approveuserformatch/:userid', function (req, res) {
	console.log("----------------API------23------------");
	matchRef.orderByChild("userA").equalTo(req.params.userid).once('value', function (snapshot) {
		var aryuser = [];
		if (snapshot.exists()) {
			async.forEach(snapshot.val(), function (matchrow, callback) {
				usersRef.child(matchrow.userB).once("value", function (snapshot) {
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
		var aryuser = [];
		if (snapshot.exists()) {
			async.forEach(snapshot.val(), function (matchrow, callback) {
				usersRef.child(matchrow.userA).once("value", function (snapshot) {
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

//25) GetCountriesForUser
app.get('/countries/:userid', function (req, res) {
	console.log("----------------API------25------------");
	usersRef.child(req.params.userid + "/countries").once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.status(404).end();
		}
	});
});

//26) AddUserCountriesForUser
app.put('/countries/:userid', function (req, res) {
	console.log("----------------API------26------------");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		if (snapshot.exists()) {
			var userinfo = snapshot.val();
			var countries = [];
			console.log(userinfo);
			if (userinfo.hasOwnProperty("countries"))
				countries = userinfo.countries;

			if (countries.indexOf(req.body.country) == -1) {
				countries.push(req.body.country);
				usersRef.child(req.params.userid + "/countries").set(countries, function (error) {
					if (error) {
						res.status(500).end();
					} else {
						res.send(countries);
					}
				});
			} else {
				res.send(countries);
			}
		} else {
			res.status(404).end();
		}
	});
});

//27) DeleteCountryForUser
app.delete('/countries/:userid', function (req, res) {
	console.log("----------------API------27------------");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		if (snapshot.exists()) {
			var userinfo = snapshot.val();
			var countries = [];
			console.log(userinfo);
			if (userinfo.hasOwnProperty("countries"))
				countries = userinfo.countries;

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
			res.status(404).end();
		}
	});
});

//28) Get a moment by id
app.get('/moments/:momentid', function (req, res) {
	console.log("----------------API------28------------");
	momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
		if (snapshot.exists())
			res.send(snapshot.val());
		else
			res.status(404).end();
	});
});







module.exports = app;
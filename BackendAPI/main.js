var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase-admin');
var lodash = require('lodash');
async = require('async');
var nodemailer = require('nodemailer');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
var download = require('download-file');
var randomstring = require("randomstring");



var serviceAccount = require("./brizeo-7571c-firebase-adminsdk.json");
//var serviceAccount = require("./fir-test1-7cb44-firebase-adminsdk-4mixq-144aafe9a8.json");
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(express.bodyParser({limit: '50mb'}));
//app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

var getUserStatus = function (userid1, userid2) {
	return new Promise(function (resolve, reject) {
		var matches = [];
		console.log(userid1, "------", userid2);
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

app.get('/test', function (req, res) {
	res.send("kkk");
})


//1) SignUp
app.post('/users', function (req, res) {
	console.log("----------------API------01------------");
	// var newuser = {
	// 	age:40,
	// 	facebookId:324345345,
	// 	gender:"male",
	// 	mainProfileImage:"http://chortle.ccsu.edu/qbasic/AppendixA/000Start.gif",
	// 	otherProfileImages:["https://www.codeproject.com/KB/aspnet/Protect_files_to_downloas/errordownload.jpg", "https://www.joomunited.com/images/com_droppics/138/WP-file-download.png"]
	// }
	var newuser = req.body.newuser;
	console.log(newuser);

	var downUrls = [];
	if (newuser['mainProfileImage'] != undefined) {
		console.log("main");
		downUrls.push(newuser['mainProfileImage']);
	}

	if (newuser['otherProfileImages'] != undefined) {
		console.log("other");
		downUrls = downUrls.concat(newuser['otherProfileImages']);
	}

	console.log(downUrls);
	newuser.otherProfileImages = [];
	newuser.thumbnailImages = [];
	console.log(downUrls);
	async.forEach(downUrls, function (downUrl, callback) {
		console.log("step1---", downUrl);
		dotdeli = downUrl.split('.').length;
		var exten = "jpg";
		if (dotdeli > 1) {
			exten = downUrl.split('.')[dotdeli - 1];
		}

		filename = randomstring.generate(32) + "." + exten

		var options = {
			directory: "./uploads/",
			filename: filename
		}
		var newname = __dirname + "/uploads/" + filename;
		console.log(newname);
		download(downUrl, options, function (err) {
			if (err)
				callback("download error")
			else {
				bucket.upload(newname, function (err, file) {
					if (err) {
						console.log("bucket upload error", err);
						callback();

					} else {
						console.log("bucket upload success");
						console.log("step5");

						file.makePublic().then(function (data) {
							if (newuser['mainProfileImage'] != undefined && newuser['mainProfileImage'] == downUrl)
								newuser['mainProfileImage'] = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + filename;
							else {
								newuser['otherProfileImages'].push("https://storage.googleapis.com/brizeo-7571c.appspot.com/" + filename);
								newuser['thumbnailImages'].push("");
							}
							callback();
						}).catch(function (err) {
							console.log(err);
							callback('public error');
						});
					}
				});
			}
		})
	}, function (err) {
		console.log(newuser);
		var newuserref = usersRef.push();
		newuser.objectId = newuserref.key;
		newuserref.set(newuser, function (error) {
			if (error)
				res.sendStatus(500);
			else {
				preferencesRef.child(newuserref.key).set(newpref, function (error) {
					res.send(newuserref.key);
				});
			}
		});
	});
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
app.post('/upload/:userid/:type', upload.fields([{ name: 'uploadFile', maxCount: 1 }, { name: 'thumbnailImage', maxCount: 1 }]), function (req, res) {
	console.log("----------------API------03------------");
	// var newuser = {
	// 	age:40,
	// 	facebookId:324345345,
	// 	gender:"male",
	// 	mainProfileImage:"http://chortle.ccsu.edu/qbasic/AppendixA/000Start.gif",
	// 	otherProfileImages:["https://www.codeproject.com/KB/aspnet/Protect_files_to_downloas/errordownload.jpg", "https://www.joomunited.com/images/com_droppics/138/WP-file-download.png"]
	// }
	var userinfo = {};
	console.log(req.body);
	console.log(req.params);
	console.log("step1");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		console.log("step2");
		if (snapshot.exists()) {
			userinfo = snapshot.val()
			console.log("step21");
			var upFiles = [];
			if (req.files != undefined && Object.keys(req.files).indexOf("uploadFile") != -1 && req.files['uploadFile'] != undefined) {
				console.log("main");
				upFiles = req.files['uploadFile'];
			} else {
				if (req.params.type == "main") {
					console.log("step22");
					res.sendStatus(404);
					return;
				} else {
					console.log("step23");
					if (req.body.oldurl != undefined && userinfo.hasOwnProperty("otherProfileImages")) {
						var indexToDel = userinfo.otherProfileImages.indexOf(req.body.oldurl)
						if (indexToDel != -1) {
							console.log("step24");
							userinfo.otherProfileImages.splice(indexToDel, 1);
							if (userinfo.hasOwnProperty("thumbnailImages"))
								userinfo.thumbnailImages.splice(indexToDel, 1);
							usersRef.child(req.params.userid).update(userinfo, function (error) {
								console.log("step25");
								if (error)
									res.sendStatus(500)
								else
									res.sendStatus(userinfo);
							})
						} else
							res.sendStatus(500);
					} else
						res.sendStatus(404);
				}
				console.log("step26");
				return;
			}

			if (req.files != undefined && Object.keys(req.files).indexOf("thumbnailImage") != -1 && req.files['thumbnailImage'] != undefined) {
				console.log("other");
				upFiles = upFiles.concat(req.files['thumbnailImage']);
			}

			async.forEach(upFiles, function (upFile, callback) {
				console.log(upFile);
				if (fs.statSync(__dirname + "/" + upFile.path).isFile()) {
					dotdeli = upFile.originalname.split('.').length;
					var exten = "jpg";
					if (dotdeli > 1) {
						exten = upFile.originalname.split('.')[dotdeli - 1];
					}
					console.log("step3");
					var newname = __dirname + "/" + upFile.path + "." + exten;
					fs.rename(__dirname + "/" + upFile.path, newname);
					console.log("step4");
					bucket.upload(newname, function (err, file) {
						if (err) {
							console.log("bucket upload error", err);
							callback();
						} else {
							console.log("bucket upload success");
							console.log("step5");

							file.makePublic().then(function (data) {
								if (req.params.type == "main") {
									userinfo.mainProfileImage = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name;
								} else {
									console.log("step6");
									if (!userinfo.hasOwnProperty("otherProfileImages")) {
										console.log("step7");
										userinfo.otherProfileImages = [];
										userinfo.thumbnailImages = [];
										if (upFile.fieldname == "uploadFile") {
											userinfo.otherProfileImages.push("https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name);
											if (req.files['thumbnailImage'] == undefined)
												userinfo.thumbnailImages.push("");
										}
										else
											userinfo.thumbnailImages.push("https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name);
									} else {
										userinfo.otherProfileImages = userinfo.otherProfileImages;
										if (!userinfo.hasOwnProperty("thumbnailImages"))
											userinfo.thumbnailImages = [];
										else
											userinfo.thumbnailImages = userinfo.thumbnailImages;

										if (req.body.oldurl == undefined) {
											console.log("step8");
											if (upFile.fieldname == "uploadFile") {
												userinfo.otherProfileImages.push("https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name);
												if (req.files['thumbnailImage'] == undefined)
													userinfo.thumbnailImages.push("");
											}
											else
												userinfo.thumbnailImages.push("https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name);

										} else {
											console.log(indexToDel);
											indexToDel = userinfo.otherProfileImages.indexOf(req.body.oldurl);
											if (indexToDel != -1) {
												if (upFile.fieldname == "uploadFile") {
													userinfo.otherProfileImages[indexToDel] = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name;
													if (req.files['thumbnailImage'] == undefined)
														userinfo.thumbnailImages[indexToDel] = "";
												} else
													userinfo.thumbnailImages[indexToDel] = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name;
											}
										}
									}
								}
								callback();
							});
						}
					});
				};
			}, function (err) {
				usersRef.child(req.params.userid).update(userinfo, function (error) {
					if (error)
						res.sendStatus(500)
					else
						res.sendStatus(200);
				});
			});
		}
		else
			res.sendStatus(404);
	});
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

var getUpSuperUserMoment = function (moments) {
	var superUserId = "WlsuoQxwUB";
	superusermoments = lodash.filter(moments, { userId: superUserId });
	newmoments = lodash.reject(moments, { userId: superUserId });
	newmoments = lodash.concat(superusermoments, newmoments);
	console.log(newmoments.length)
	return newmoments;
}

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
				moments = lodash.filter(moments, { passionId: filterstr });
			moments = lodash.sortBy(moments, sortstr).reverse();

			async.forEach(moments, function (moment, callback) {
				console.log("----moment---------", moment);
				usersRef.child(moment.userId).once("value", function (snapshot) {
					console.log(snapshot.val());
					if (snapshot.exists()) moment.user = snapshot.val();
					callback();
				});
			}, function (err) {
				res.send(getUpSuperUserMoment(moments));
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
		momentImagesRef.orderByChild("passionId").equalTo(filterstr).once("value", function (snapshot) {
			if (snapshot.exists())
				moments = lodash.sortBy(snapshot.val(), sortstr).reverse();

			async.forEach(moments, function (moment, callback) {
				if (moment.hasOwnProperty("userId")) {
					usersRef.child(moment.userId).once("value", function (snapshot) {
						if (snapshot.exists()) moment.user = snapshot.val();
						callback();
					});
				} else
					callback();
			}, function (err) {
				res.send(getUpSuperUserMoment(moments));
			});
		});
	} else {
		momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
			if (snapshot.exists()) {
				snapshot.forEach(function (moment) {
					moments.push(moment.val());
				});
				moments = moments.reverse();
				async.forEach(moments, function (moment, callback) {
					if (moment.hasOwnProperty("userId")) {
						usersRef.child(moment.userId).once("value", function (snapshot) {
							if (snapshot.exists()) moment.user = snapshot.val();
							callback();
						});
					} else
						callback();
				}, function (err) {
					console.log(moments.length)
					res.send(getUpSuperUserMoment(moments));
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
				arymoments = lodash.filter(arymoments, { passionId: filterstr });
			console.log(arymoments);
			arymoments = lodash.sortBy(arymoments, sortstr).reverse();
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
				res.send(getUpSuperUserMoment(arymoments));
			});
		});

	});
});

//10) CreateMoment
app.put('/moments', upload.fields([{ name: 'uploadFile', maxCount: 1 }, { name: 'thumbnailImage', maxCount: 1 }]), function (req, res) {
	console.log("----------------API------10------------");
	newmoment = req.body.newmoment;
	// var newmoment = {
	// 	userId:"Eqg4O5xfFp",
	// 	readStatus:true
	// }

	var upFiles = [];

	if (req.files['uploadFile'] != undefined) {
		console.log("main");
		upFiles = req.files['uploadFile'];
	}

	if (req.files['thumbnailImage'] != undefined) {
		console.log("other");
		upFiles = upFiles.concat(req.files['thumbnailImage']);
	}

	async.forEach(upFiles, function (upFile, callback) {
		console.log(upFile);
		if (fs.statSync(__dirname + "/" + upFile.path).isFile()) {
			dotdeli = upFile.originalname.split('.').length;
			var exten = "jpg";
			if (dotdeli > 1) {
				exten = upFile.originalname.split('.')[dotdeli - 1];
			}
			console.log("step3");
			var newname = __dirname + "/" + upFile.path + "." + exten;
			fs.rename(__dirname + "/" + upFile.path, newname);
			console.log("step4");
			bucket.upload(newname, function (err, file) {
				if (err) {
					console.log("bucket upload error", err);
					callback("upload error");
				} else {
					console.log("bucket upload success");
					console.log("step5");

					file.makePublic().then(function (data) {
						if (upFile.fieldname == "uploadFile")
							newmoment.momentsUploadImage = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name;
						else
							newmoment.thumbnailImage = "https://storage.googleapis.com/brizeo-7571c.appspot.com/" + file.name;
						callback();
					});
				}
			});
		} else {
			console.log("bucket upload error", err);
			callback("upload error");
		}
	}, function (err) {
		if (err) {
			res.status(500).end();
			return;
		}
		newmomentref = momentImagesRef.push();
		newmoment.objectId = newmomentref.key;
		newmomentref.set(newmoment, function (error) {
			if (error) {
				res.status(500).end();
			} else {
				res.send(newmomentref.key).end();
			}
		});
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
			res.status(404).end();
		}
	});
});

//12) GetLikersForMomentByMomentId
app.get('/likemoments/users/:momentid/:userid', function (req, res) {
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
					if (snapshot.exists()) {
						var liker = snapshot.val();
						getUserStatus(liker.objectId, req.params.userid).then(function (status) {
							status1 = status;
							getUserStatus(req.params.userid, liker.objectId).then(function (status) {
								status2 = status;
								var resstatus = 1;
								if (status2 == -1)
									liker.status = status1 + 2;
								else if (status2 == 0)
									liker.status = status1 + 5;
								else if (status2 == 1)
									liker.status = status1 + 8;
								aryuser.push(liker);
								console.log(liker);
								callback();
							}).catch(function (e) {
								callback();
								console.log(e);
							});
						}).catch(function (e) {
							callback();
							console.log(e);
						});
					} else
						callback();
				});
			}, function (err) {
				console.log("------aryuser----------", aryuser);
				res.json(aryuser);
			});
		} else
			res.send(aryuser);
	});
});

//13) ReportMoment
app.post('/reportmoment/:momentid/:userid', function (req, res) {
	console.log("----------------API------13------------");
	var messageText = "";
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			messageText = "User mail : " + snapshot.val().objectId + ", Name : " + snapshot.val().displayName;
			momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
				console.log(snapshot.val());
				if (snapshot.exists()) {
					messageText += " reported " + "image : " + snapshot.val().momentsUploadImage;
					mailOptions.text = messageText;
					console.log(messageText);
					smtpTransport.sendMail(mailOptions, function (error, response) {
						if (error) {
							console.log(error);
							res.status(500).end();
						} else {
							console.log("Message sent : " + response.response);
							res.status(200).end();
						}
						smtpTransport.close();
					});
				} else
					res.status(404).end();
			});
		} else
			res.status(404).end();
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
app.get('/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------15------------");
	getUserStatus(req.params.userid1, req.params.userid2).then(function (status) {
		status1 = status;
		getUserStatus(req.params.userid2, req.params.userid1).then(function (status) {
			status2 = status;
			console.log("------status1--", status1, "-----status2---", status2, "------------");
			usersRef.child(req.params.userid2).once("value", function (snapshot) {
				if (snapshot.exists()) {
					var resstatus = 1;
					if (status2 == -1)
						resstatus = status1 + 2;
					else if (status2 == 0)
						resstatus = status1 + 5;
					else if (status2 == 1)
						resstatus = status1 + 8;
					var user = snapshot.val();
					console.log(user);
					user.status = resstatus;
					res.send(user);
				} else {
					res.sendStatus(404);
				}
			});
		}).catch(function (e) {
			console.log(e);
			res.sendStatus(404);
		});
	}).catch(function (e) {
		console.log(e);
		res.sendStatus(404);
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
					console.log("step1");
					if (snapshot.exists()) {
						moment = snapshot.val();
						console.log(moment);
						if (!moment.hasOwnProperty("likedBycurrentUser"))
							moment.likedBycurrentUser = [];
						moment.numberOfLikes = Number(moment.numberOfLikes) + 1;
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
						if (Number(moment.numberOfLikes) > 0) moment.numberOfLikes = Number(moment.numberOfLikes) - 1;
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
	console.log("----------------API------19------------");
	var messageText = "";
	var date = new Date();
	var currenttime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	usersRef.child(req.params.userid1).once("value", function (snapshot) {
		if (snapshot.exists()) {
			messageText = "User mail : " + snapshot.val().objectId + ", Name : " + snapshot.val().displayName;
			usersRef.child(req.params.userid2).once("value", function (snapshot) {
				if (snapshot.exists()) {
					messageText += " reported " + "UserId : " + snapshot.val().objectId + ", Name : " + snapshot.val().displayName + " at " + currenttime;
					mailOptions.text = messageText;
					console.log(messageText);
					smtpTransport.sendMail(mailOptions, function (error, response) {
						if (error) {
							console.log(error);
							res.status(500).end();
						} else {
							console.log("Message sent : " + response.response);
							res.status(200).end();
						}
						smtpTransport.close();
					});
				} else
					res.status(404).end();
			});
		} else
			res.status(404).end();
	});
});

//20) DownloadEvent
app.post('/downloadevent/:userid1/:times', function (req, res) {
	console.log("----------------API------20------------");
	var messageText = "";
	var date = new Date();
	var currenttime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	usersRef.child(req.params.userid1).once("value", function (snapshot) {
		if (snapshot.exists()) {
			messageText = "User mail : " + snapshot.val().objectId + ", Name : " + snapshot.val().displayName;
			messageText += "   downloaded " + req.params.times + "times" + " at " + currenttime;
			mailOptions.text = messageText;
			console.log(messageText);
			smtpTransport.sendMail(mailOptions, function (error, response) {
				if (error) {
					console.log(error);
					res.status(500).end();
				} else {
					console.log("Message sent : " + response.response);
					res.status(200).end();
				}
				smtpTransport.close();
			});
		} else
			res.status(404).end();
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
				getUserStatus(req.params.userid2, req.params.userid1).then(function (status2) {
					var mutualStatus = 2;
					if (status2 == -1)
						mutualStatus = status + 2;
					else if (status2 == 0)
						mutualStatus = status + 5;
					else if (status2 == 1)
						liker.status = status + 8;
					console.log(mutualStatus);
					res.send(mutualStatus + "");
				}).catch(function (e) {
					console.log(e);
					res.status(500).end();
				});
				return;
			}
		}

		matchRef.push(appr, function (error) {
			if (error)
				res.status(404).end();
			else {
				getUserStatus(req.params.userid2, req.params.userid1).then(function (status2) {
					var mutualStatus = 2;
					if (status2 == -1)
						mutualStatus = status + 2;
					else if (status2 == 0)
						mutualStatus = status + 5;
					else if (status2 == 1)
						liker.status = status + 8;
					console.log(mutualStatus);
					res.send(mutualStatus + "");
				}).catch(function (e) {
					console.log(e);
					res.status(500).end();
				});
			}
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

function calculateDistance(lat1, lon1, lat2, lon2) {
	var R = 3959; // mile
	var dLat = (lat2 - lat1).toRad();
	var dLon = (lon2 - lon1).toRad();
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
}

Number.prototype.toRad = function () {
	return this * Math.PI / 180;
}

//23) GetUsersForMatch
app.get('/approveuserformatch/:userid', function (req, res) {
	console.log("----------------API------23------------");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		if (snapshot.exists()) {
			curuser = snapshot.val();
			preferencesRef.child(req.params.userid).once("value", function (snapshot) {
				if (!snapshot.exists())
					pref = snapshot.val();
				else
					pref = newpref;
				if (!pref.hasOwnProperty("searchLocation")) pref.searchLocation = curuser.currentLocation;
				distance = pref.maxSearchDistance;
				maxage = pref.upperAgeLimit;
				minage = pref.lowerAgeLimit;
				searchlocation = pref.searchLocation;


				matchRef.orderByChild("userB").equalTo(req.params.userid).once('value', function (snapshot) {
					var aryuser = [];
					if (snapshot.exists()) {
						async.forEach(snapshot.val(), function (matchrow, callback) {
							usersRef.child(matchrow.userA).once("value", function (snapshot) {
								console.log(snapshot.val());
								if (snapshot.exists()) {
									otheruser = snapshot.val();
									if (otheruser.age >= minage && otheruser.age <= maxage && pref.genders.indexOf(otheruser.gender) != -1 &&
										calculateDistance(otheruser.currentLocation.latitide, otheruser.currentLocation.longitude, searchLocation.latitude, searchLocation.longitude) < distance)
										aryuser.push(snapshot.val());								
								}
								callback();
							});
						}, function (err) {
							res.json(aryuser);
						});
					} else
						res.send(aryuser);
				});
			});

		} else
			res.sendStatus(404);
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

//29) Get a moment by id
app.get('/moments/:momentid', function (req, res) {
	console.log("----------------API------29------------");
	momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
		if (snapshot.exists())
			res.send(snapshot.val());
		else
			res.status(404).end();
	});
});

//30 Update moment
app.put('/moments/:momentid', function (req, res) {
	console.log("----------------API------30------------");
	momentImagesRef.child(req.params.momentid).update(req.body.newmoment, function (error) {
		if (error)
			res.sendStatus(404);
		else
			res.sendStatus(200);
	});
});






module.exports = app;
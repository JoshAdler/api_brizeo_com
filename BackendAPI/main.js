var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase-admin');
var lodash = require('lodash');
async = require('async');
var nodemailer = require('nodemailer');
var multer = require('multer');
var upload = multer({ dest: __dirname+'/uploads/' });
var fs = require('fs');
var download = require('download-file');
var randomstring = require("randomstring");
var FCM = require('fcm-push');
var Thumbnail = require('thumbnail');
var FB = require('facebook-node');
var gm = require("gm");
var jwt = require('jsonwebtoken');
var Wreck = require('wreck');




FB.setApiVersion("v2.8");

var serviceAccount = require("./dev_configs/brizeo-development-bf561-firebase-adminsdk-2bzrp-5ccecab264.json");
//var serviceAccount = require("./fir-test1-7cb44-firebase-adminsdk-4mixq-144aafe9a8.json");
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function makeJWT(username) {
	var token = jwt.sign(
		{
			username: username
		}, 
		secretkey, 
		{
			expiresIn: '14d'
		});
	return token;
}

//app.use(express.bodyParser({limit: '50mb'}));
//app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));



firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: 'https://brizeo-development-bf561.firebaseio.com'
	//	databaseURL: 'https://fir-test1-7cb44.firebaseio.com/'
});


var gcs = require('@google-cloud/storage')({
	projectId: "brizeo-development-bf561",
	keyFilename: './dev_configs/brizeo-development-bf561-firebase-adminsdk-2bzrp-5ccecab264.json',
});

var bucket = gcs.bucket('brizeo-development-bf561.appspot.com');

console.log("========================BUCKET================================="+bucket);

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




var thumbnail = new Thumbnail('./uploads', './thumbnails');




var db = firebase.database();

var usersRef = db.ref("/User");
var preferencesRef = db.ref("/Preferences");
var momentImagesRef = db.ref("/MomentImages");
var momentImageLikesRef = db.ref("/MomentImageLikes");
var passionsRef = db.ref("/Passions");
var matchRef = db.ref("/Match");
var notificationRef = db.ref("/Notifications");
var eventsRef = db.ref("/Events");
var testsRef = db.ref("/MyRef");

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

var superUserId = "WlsuoQxwUB";


var secretkey = "SeCrEtKeYfOrHaShInG";
const authMiddleware = (req, res, next) => {
    // read the token from header or url 
    console.log("req",req.originalUrl);
    const token = req.headers['x-access-token'] || req.query.token;
    const userId=req.headers['x-user-id'] || req.query["user-id"];

    // token does not exist
    if(!token || !userId) {
    	console.log("================================missing user id & Token======================================");
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }

	try {
		var decoded = jwt.verify(token,secretkey);
		if(decoded.username==userId){
			req.decoded=decoded;
			console.log("succcccccccccces");
			next();
		}else{
				console.log("=========tokens mismatch========");
				res.json({
	        	status:403,
	            success: false,
	            message:"Invalid Token"
	        })	
		}
        /*Logic for checking ends.*/
	} catch(err){
     	console.log("errrrrrrrrrrrror",err);
        res.json({
        	status:403,
            success: false,
            message: err.message
        })
	}
}


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

var registerNotification = function (sendUser, receiveUser, type, id) {
	var newnotification = {
		sendUser: sendUser,
		receiveUser: receiveUser,
		pushType: type,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	}

	usersRef.child(sendUser).once("value", function (snapshot) {
		if (!snapshot.exists()) return;
		var sendtext = "";
		var soundType="";
/*First name Only logic*/
		var displayName=snapshot.val().displayName;
		if(displayName.split(" ").length>1){
			displayName=displayName.split(" ")[0];
		}
/*First name Only logic endsss.*/		
		if (type == "newmatch") {
			newnotification.newmatchid = id;
			sendtext = displayName + " matched you.";
			soundType="sound_matches.wav";
		} else if (type == "momentslike") {
			newnotification.momentsid = id;
			sendtext = displayName + " liked your moment."
			soundType="sound_likes.wav";
		}

		console.log(newnotification);
		newnotiref = notificationRef.push();
		newnotification.objectId = newnotiref.key;
		newnotiref.set(newnotification);

		usersRef.child(receiveUser).once("value", function (snapshot) {
			console.log('step1');
			if (!snapshot.exists()) return;
			user = snapshot.val();
			console.log('step2');
			preferencesRef.child(receiveUser).once("value", function (snapshot) {
				console.log('step3');
				if (snapshot.exists()) {
					if (type == "newmatch" && snapshot.val().isNotificationsNewMatchesOn == false || type == "momentslike" && snapshot.val().isNotificationsMomentsLikesOn == false) {
						return;
					}
				}
				console.log('step4');
				if (user.hasOwnProperty("deviceToken")) {
					//add sound in notification: i.e notification.body, sound
					var message = {
						to: user.deviceToken, // required fill with device token or topics
						data: {
							userid: sendUser,
							type: type
						},
						notification: {
							body: sendtext,
							sound:soundType
						}
					};
					sendPushNotification(message)
				}
			});

		});
	});
}

var sendPushNotification = function (message) {
	console.log(message)
	var serverKey = "AIzaSyC2Db73kmVDNTWbwpWgQOmfxRWy1tTo7S0";
	var fcm = new FCM(serverKey);

	//callback style
	fcm.send(message, function (err, response) {
		if (err) {
			console.log(err);
			console.log("Something has gone wrong!");
		} else {
			console.log("Successfully sent with response: ", response);
		}
	});
	/*
		fcm.send(message)
		.then(function(response){
			console.log("Successfully sent with response: ", response);
		})
		.catch(function(err){
			console.log("Something has gone wrong!");
			console.error(err);
		})
	*/
}

app.get('/test', function (req, res) {
	type = "newmatch";
			preferencesRef.child("-Kg-Y1EQa5uBpZHr70oi1").once("value", function (snapshot) {
				console.log('step3');
				console.log(snapshot.val().isNotificationsNewMatchesOn);
				if (snapshot.exists()) {
					if (type == "newmatch" && snapshot.val().isNotificationsNewMatchesOn == false || type == "momentslike" && snapshot.val().isNotificationsMomentsLikesOn == false) {
						return;
					}
				}
				res.sendStatus(200);
			});
})

/*
app.use('/brizeo/',function(req,res,next){
	console.log("common Auth Function called");
	authMiddleware(req,res,next);
});

*/

function getFileExtension(fileurl) {
	var arr = fileurl.split("?");
	arr = arr[0].split("#");
	url = arr[0];
	return (url.indexOf(".") < 0) ? "" : url.substring(url.lastIndexOf(".") + 1, url.length);
}

//1) SignUp
app.post('/users', function (req, res) {
	console.log("----------------API------01------------");
	// var newuser = {
	// 	age: 40,
	// 	facebookId: 324345345,
	// 	gender: "male",
	// 	mainProfileImage: "http://chortle.ccsu.edu/qbasic/AppendixA/000Start.gif",
	// 	otherProfileImages: ["https://www.codeproject.com/KB/aspnet/Protect_files_to_downloas/errordownload.jpg", "https://www.joomunited.com/images/com_droppics/138/WP-file-download.png"]
	// }
	var newuser = req.body.newuser;
	console.log("----------step1----------", newuser);
	//	var newuser = JSON.parse(JSON.stringify(req.body.newuser));
	console.log(newuser);

	var downUrls = [];
	if (newuser['mainProfileImage'] != undefined) {
		console.log("main");
		downUrls.push(newuser.mainProfileImage);
	}

	if (newuser['otherProfileImages'] != undefined) {
		console.log("other");
		downUrls = downUrls.concat(newuser.otherProfileImages);
	}

	console.log(downUrls);
	newuser.otherProfileImages = [];
	newuser.thumbnailImages = [];
	console.log(downUrls);
	async.forEach(downUrls, function (downUrl, callback) {
		console.log("step1---", downUrl);
		var exten = getFileExtension(downUrl);

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
								newuser.mainProfileImage = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
							else {
								newuser.otherProfileImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
								newuser.thumbnailImages.push("");
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
		console.log("---err----", err);
		//		usersRef.push(newuser);
		console.log(newuser);
		newuserref = usersRef.push();
		newuser.objectId = newuserref.key;
		newuser.jwt=makeJWT(newuser.objectId);
		console.log("-----------key-----------", newuserref.key);
		usersRef.child(newuserref.key).set(newuser, function (error) {
			if (error)
				res.sendStatus(500);
			else {
				superUserMatch1 = {
					status: 1,
					userA: superUserId,
					userB: newuserref.key
				}
				superUserMatch2 = {
					status: 1,
					userA: newuserref.key,
					userB: superUserId
				}

				matchRef.push(superUserMatch1);
				matchRef.push(superUserMatch2);
				preferencesRef.child(newuserref.key).set(newpref, function (error) {
					res.send(newuser);
				});
			}

		});
		//newref.set(newuser);
		// newuser = {};
		// newuser.objectId = newuserref.key;
	});
});

//2) GetCurrentUser (userid)->user
app.get('/users/:fbid', function (req, res) {
	console.log("----------------API------02------------",req.params.fbid);
	usersRef.orderByChild("facebookId").equalTo(req.params.fbid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			for (key in snapshot.val()) {
				var userinfo = snapshot.val()[key];
				userinfo.jwt = makeJWT(key);
				res.send(userinfo);
				return;
			}
		} else {
			res.status(404).end();
		}
	});
});

function checkThumbnailBugs(userinfo) {
	if (userinfo.hasOwnProperty("otherProfileImages")) {
		var len = userinfo.otherProfileImages.length;
		if (!userinfo.hasOwnProperty("thumbnailImages") || len > userinfo.thumbnailImages.length) {
			if (!userinfo.hasOwnProperty("thumbnailImages")) {
				userinfo.thumbnailImages = [];
				lenthum = 0;
			}
			else
				lenthum = userinfo.thumbnailImages.length;

			for (i = 0; i < len - lenthum; i++) {
				userinfo.thumbnailImages.push("");
			}
		}
	}
}

//3) UploadFilesForUser (It may be images or videos)
app.post('/brizeo/upload/:userid/:type', upload.fields([{ name: 'uploadFile', maxCount: 1 }, { name: 'thumbnailImage', maxCount: 1 }]), function (req, res) {
	console.log("----------------API------03------------");
	console.log("==========================================================#3===image start================"+new Date());
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
				console.log("=========Parth===========================upFILES=========",upFiles);
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
								else{
									console.log("===================================#3=========================image end================"+new Date());
									res.send(userinfo);
								}
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
					var exten = getFileExtension(upFile.originalname);
					console.log("step3");
					var newname = __dirname + "/" + upFile.path + "." + exten;
					fs.renameSync(__dirname + "/" + upFile.path, newname);
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
									userinfo.mainProfileImage = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
									thumbnail.ensureThumbnail(upFile.filename + "." + exten, 1000, null, function (err, filename) {
								 		console.log("----err----", err);
										if (!err) {
											console.log(filename);
											bucket.upload("./thumbnails/" + filename, function (err, file) {
												if (err) {
													console.log("thumbnail bucket upload error", err);
													callback("upload error");
												} else {
													console.log("thumbnail bucket upload success");
													console.log("step52");
													file.makePublic().then(function (data) {
														userinfo.mainthumbnailImage = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
														callback();
													});
												}
											});

										} else
											callback();
									});
								} else {
									console.log("step6");
									if (!userinfo.hasOwnProperty("otherProfileImages")) {
										console.log("step7");
										userinfo.otherProfileImages = [];
										userinfo.thumbnailImages = [];
										if (upFile.fieldname == "uploadFile") {
											userinfo.otherProfileImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
											if (req.files['thumbnailImage'] == undefined) {
												thumbnail.ensureThumbnail(upFile.filename + "." + exten, 400, null, function (err, filename) {
													console.log("----err----", err);
													if (!err) {
														console.log(filename);
														bucket.upload("./thumbnails/" + filename, function (err, file) {
															if (err) {
																console.log("thumbnail bucket upload error", err);
																callback("upload error");
															} else {
																console.log("thumbnail bucket upload success");
																console.log("step52");
																file.makePublic().then(function (data) {
																	userinfo.thumbnailImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
																	callback();
																});
															}
														});

													} else
														callback();
												});
											} else
												callback();
										}
										else {
											userinfo.thumbnailImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
											callback();
										}
									} else {
										if (!userinfo.hasOwnProperty("thumbnailImages"))
											userinfo.thumbnailImages = [];

										if (req.body.oldurl == undefined) {
											console.log("step8");
											if (upFile.fieldname == "uploadFile") {
												userinfo.otherProfileImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
												if (req.files['thumbnailImage'] == undefined) {
													thumbnail.ensureThumbnail(upFile.filename + "." + exten, 400, null, function (err, filename) {
														console.log("----err----", err);
														if (!err) {
															console.log(filename);
															bucket.upload("./thumbnails/" + filename, function (err, file) {
																if (err) {
																	console.log("thumbnail bucket upload error", err);
																	callback("upload error");
																} else {
																	console.log("thumbnail bucket upload success");
																	console.log("step52");
																	file.makePublic().then(function (data) {
																		userinfo.thumbnailImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
																		callback();
																	});
																}
															});

														} else
															callback();
													});
												} else
													callback();
											}
											else {
												userinfo.thumbnailImages.push("https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name);
												callback();
											}

										} else {
											console.log(indexToDel);
											indexToDel = userinfo.otherProfileImages.indexOf(req.body.oldurl);
											if (indexToDel != -1) {
												if (upFile.fieldname == "uploadFile") {
													userinfo.otherProfileImages[indexToDel] = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
													if (req.files['thumbnailImage'] == undefined) {
														thumbnail.ensureThumbnail(upFile.filename + "." + exten, 400, null, function (err, filename) {
															console.log("----err----", err);
															if (!err) {
																console.log(filename);
																bucket.upload("./thumbnails/" + filename, function (err, file) {
																	if (err) {
																		console.log("thumbnail bucket upload error", err);
																		callback("upload error");
																	} else {
																		console.log("thumbnail bucket upload success");
																		console.log("step52");
																		file.makePublic().then(function (data) {
																			userinfo.thumbnailImages[indexToDel] = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
																			callback();
																		});
																	}
																});

															} else
																callback();
														});
													} else
														callback();
												} else {
													userinfo.thumbnailImages[indexToDel] = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
													callback();
												}
											}
										}
									}
								}
							});
						}
					});
				};
			}, function (err) {
				usersRef.child(req.params.userid).update(userinfo, function (error) {
					if (error)
						res.sendStatus(500)
					else
						res.send(userinfo);
				});
			});
		}
		else
			res.sendStatus(404);
	});
});

//4) GetPreferencesByUserId or GetCurrentPreferences (userid)->preference
app.get('/brizeo/preferences/:userid', function (req, res) {
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
app.put('/brizeo/preferences/:userid', function (req, res) {
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
app.put('/brizeo/users/:userid', function (req, res) {
	console.log("----------------API------06------------");
	newuser = req.body.newuser;
	console.log(req.params.userid);
	console.log(newuser);
	//	checkThumbnailBugs(newuser);
	usersRef.child(req.params.userid).set(req.body.newuser, function (error) {
		if (error) {
			res.status(404).end();
		} else {
			res.status(200).end();
		}
	});
});

var getUpSuperUserMoment = function (moments) {
	superusermoments = lodash.filter(moments, { userId: superUserId });
	newmoments = lodash.reject(moments, { userId: superUserId });
	newmoments = lodash.concat(superusermoments, newmoments);
	console.log(newmoments.length)
	return newmoments;
}

//7) GetMomentsByUsedId (by default they are sorted 'newest') (userid, [popular, updated], filter)->[moments]
app.get('/brizeo/moments/:userid/:sort/:filter', function (req, res) {
	console.log("----------------API------07------------");
	var loggedInUserId=req.headers['x-user-id'];
	var userIdInQuestion=req.params.userid;
	var viewableCheck=true;
	if(loggedInUserId==userIdInQuestion){
		viewableCheck=false;
	}
	
	var sortstr = "updatedAt";
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.filter;
	momentImagesRef.orderByChild("userId").equalTo(req.params.userid).once("value", function (snapshot) {
		var moments = [];
		if (snapshot.exists()) {
			moments = snapshot.val();
			if (filterstr != "all")
				moments = lodash.filter(moments, { passionId: filterstr });
			moments = lodash.sortBy(moments, sortstr).reverse();

			usersRef.child(req.params.userid).once("value", function (snapshot) {
				if (snapshot.exists()) {
					var filteredMoments=[];
					moments.forEach(function (moment,index,object) {
						moment.user = snapshot.val();
						if(viewableCheck==true){
							console.log(moment.viewableByAll);
							var oldMoment=false;
							if(moment.hasOwnProperty("viewableByAll")==false){
								oldMoment=true;
							}
							if(moment.viewableByAll=="true"|| oldMoment==true || moment.viewableByAll==true){
								console.log("inside splice"+index);
								filteredMoments.push(moment);
							}
						}
					});
				}
				if(filteredMoments && filteredMoments.length>0){
					console.log("filtered length",filteredMoments.length);
					res.send(filteredMoments);
				}else{
					console.log("all moments=",moments.length);
					res.send(moments)
				}
			});
		} else {
			console.log("404 found");
			res.send(moments);
			return;
		}
	});
});

//8) GetAllMoments (we can combine this and the previous method in one)
app.get('/brizeo/allmoments/:sort/:filter/:pageNo', function (req, res) {
	console.log("----------------API------08------------");
	console.log(req.headers['x-access-token']);
	var sortstr = "updatedAt";
	var pageNo=parseInt(req.params.pageNo);
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.filter;
	var moments = [];

	if (filterstr != "all") {
		momentImagesRef.orderByChild("passionId").equalTo(filterstr).once("value", function (snapshot) {
			if (snapshot.exists())
				moments = lodash.sortBy(snapshot.val(), sortstr).reverse();
			var filteredArr=[];
			async.forEach(moments, function (moment, callback) {
				var isViewableByAll=moment.viewableByAll;
				if(moment.hasOwnProperty("viewableByAll")==false){
					isViewableByAll=true;
				}
				if (moment.hasOwnProperty("userId")) {
					usersRef.child(moment.userId).once("value", function (snapshot) {
						if (snapshot.exists()){
							moment.user = snapshot.val();
						}
						callback();
					});
				}else{
					callback();
				}
				if(isViewableByAll==true || isViewableByAll=="true"){
					filteredArr.push(moment);
				}

			}, function (err) {
				console.log("called after filter, filterstring not equals all");
				if (req.params.sort == "popular"){
					console.log((getUpSuperUserMoment(filteredArr)).length);
					res.send(getUpSuperUserMoment(filteredArr));
				}
				else{
					console.log(filteredArr.length);
					res.send(filteredArr);
				}
			});
		});
	} else {
		console.log("all filters===========================================",sortstr,pageNo);
		momentImagesRef.orderByChild(sortstr).once("value", function (snapshot) {
			if (snapshot.exists()) {
				snapshot.forEach(function (moment) {
					var forOldImages=false;
					if(moment.val().hasOwnProperty("viewableByAll")==false){
						forOldImages=true;
					}

					if(moment.val()["viewableByAll"]=="true" || forOldImages==true || moment.val()["viewableByAll"]==true){
						moments.push(moment.val());
					}
				});
				console.log("-========moments length"+moments.length);
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
					if (req.params.sort == "popular"){
						moments=getPaginatedItems(moments,pageNo);
						res.send(getUpSuperUserMoment(moments));
					}
					else{
						moments=getPaginatedItems(moments,pageNo);
						res.send(moments);
					}
				});
			}else{
				console.log("no resultds");
				res.send(moments);
			}
		});
	}
});

//9) GetMatchedMomentsByUserId
app.get('/brizeo/matchedmoments/:userid/:sort/:filter', function (req, res) {
	console.log("----------------API------09------------");
	if (req.params.sort == "popular") {
		sortstr = "numberOfLikes";
	}
	var filterstr = req.params.filter;
	var usersIMatchedWith=[];
	var usersWhoMatchedWithMe=[];
	var arymoments = [];
	var myMatches=[];
	matchRef.orderByChild("userA").equalTo(req.params.userid)
								.once("value",function(snapshot){
									if(snapshot.exists()){
									async.series([function(callback){
										console.log("fn 1");
										for(key in snapshot.val()){
											usersIMatchedWith.push(snapshot.val()[key].userB);
				   						 }
				   					  callback(null,myMatches);
									},function(icb2){
										console.log("fn 2");
										 matchRef.orderByChild("userB").equalTo(req.params.userid).once("value",function(snapshot){
										 	if(snapshot.exists()){
										 		var cntr=0;
										 		for(key in snapshot.val()){
										 			cntr++;
										 			console.log("snapshot.val()[key].userA",snapshot.val()[key].userA);
													usersWhoMatchedWithMe.push(snapshot.val()[key].userA);
													if(cntr==lodash.size(snapshot.val())){
														icb2();
													}
									    		}
										 	}else{
										 		res.json(arymoments);
										 	}
										 });	
									},function(icb3){
										console.log("u i m with",usersIMatchedWith);
										console.log("u w m with me",usersWhoMatchedWithMe);
										myMatches=intersection_destructive(usersIMatchedWith,usersWhoMatchedWithMe);
										if(myMatches.length==0){
											res.json(arymoments);
										}
										console.log("myMatches",myMatches);
										icb3();
									},function(icb4){
										//include all moments of myMatches.
										var cntr=0;
										async.forEach(myMatches,function(curMatch,cb){
											console.log("cuuuuuuuuurMatch",curMatch);
											momentImagesRef.orderByChild("userId").equalTo(curMatch).once("value", function (snapshot) {
												if (snapshot.exists()) {
												console.log("inside match");
													for(key in snapshot.val()){
														arymoments.push(snapshot.val()[key]);
													} 
												 }
												cntr++;
												 if(cntr==myMatches.length){
												     icb4();
											     }	
											});
										});
									},function(icb5){
										console.log("step 5: Adding current Likers & User Object of person who uploaded moment");
										var cntr=0;
										if(arymoments.length==0){
											res.json(arymoments);
										}
											async.forEach(arymoments,function(curMoment,cb){
												usersRef.child(curMoment.userId).once("value", function (spo) {
													console.log("user obj update");
													curMoment["user"]=spo.val();
														cntr++;
														if(cntr==arymoments.length){
															icb5();
												      }
												});

											})
									},function(icb6){
										console.log("steeeeeeeep 6:::filter");
										var sortstr = "updatedAt";
										if (req.params.sort == "popular") {
											sortstr = "numberOfLikes";
										}
										var filterstr = req.params.filter;
										if (filterstr != "all"){
											arymoments = lodash.filter(arymoments, { passionId: filterstr });
										}
										arymoments = lodash.sortBy(arymoments, sortstr).reverse();
										res.json(arymoments);
									}])
									}else{
										console.log("in elseeeeeee");
										res.json(arymoments);
									}
	});
/*
	console.log("----------------API------09------------");
	console.log(req.headers['x-access-token']);
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
				res.send(arymoments);
			});
		});

	});
	*/
});

//10) CreateMoment
app.put('/brizeo/moments', upload.fields([{ name: 'uploadFile', maxCount: 1 }, { name: 'thumbnailImage', maxCount: 1 }]), function (req, res) {
	console.log("----------------API------10------------");
	// var newmoment = {
	// 	userId: "Eqg4O5xfFp",
	// 	readStatus: true
	// }
	console.log("==================================================================image start================"+new Date());
	newmoment = req.body.newmoment;
	newmoment.numberOfLikes = 0;

	var upFiles = [];
console.log("================req.files['uploadFile']",req.files['uploadFile']);
	if (req.files['uploadFile'] != undefined) {
		console.log("main");
		upFiles = req.files['uploadFile'];
	}
console.log("===============req.files['thumbnailImage']",req.files['thumbnailImage']);
	if (req.files['thumbnailImage'] != undefined) {
		console.log("other");
		upFiles = upFiles.concat(req.files['thumbnailImage']);
	}
console.log("==============upFIles=====================",upFiles);
	async.forEach(upFiles, function (upFile, callback) {
		console.log(upFile);
		if (fs.statSync(upFile.path).isFile()) {
			var exten = getFileExtension(upFile.originalname);
			console.log("step3");
			var newname =  upFile.path + "." + exten;
			fs.renameSync(upFile.path, newname);
			//var newname = __dirname + "/" + upFile.path + "." + exten;
			//fs.renameSync(__dirname + "/" + upFile.path, newname);
			console.log("step4");
			bucket.upload(newname, function (err, file) {
				if (err) {
					console.log("bucket upload error", err);
					callback("upload error");
				} else {
					console.log("----------file-------", file.name);
					console.log("bucket upload success");
					console.log("step5");

					file.makePublic().then(function (data) {
						if (upFile.fieldname == "uploadFile") {
							newmoment.momentsUploadImage = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
							if (req.files['thumbnailImage'] == undefined) {
								console.log("step51")
								thumbnail.ensureThumbnail(upFile.filename + "." + exten, 1000, null, function (err, filename) {
									console.log("----err----", err);
									if (!err) {
										console.log(filename);
										bucket.upload("./thumbnails/" + filename, function (err, file) {
											if (err) {
												console.log("thumbnail bucket upload error", err);
												callback("upload error");
											} else {
												console.log("thumbnail bucket upload success");
												console.log("step52");
												file.makePublic().then(function (data) {
													newmoment.thumbnailImage = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
													callback();
												});
											}
										});

									} else
										callback();
								});
							} else
								callback();
						} else {
							newmoment.thumbnailImage = "https://storage.googleapis.com/brizeo-development-bf561.appspot.com/" + file.name;
							callback();
						}
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
		newmoment.createdAt = new Date().toISOString();
		newmomentref.set(newmoment, function (error) {
			if (error) {
				res.status(500).end();
			} else {
				res.send(newmomentref.key).end();
			console.log("==================================================================image end================"+new Date());
			}
		});
	});
});

//11) GetAllInterests (It means «travel», «foodie», etc.)
app.get('/brizeo/passions', function (req, res) {
	console.log("----------------API------11------------");
	passionsRef.once("value", function (snapshot) {
		if (snapshot.exists()) {
			res.send(snapshot.val());
		} else {
			res.status(404).end();
		}
	});
});

//12) GetLikersForMomentByMomentId
app.get('/brizeo/likemoments/users/:momentid/:userid', function (req, res) {
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
								var resstatus = status1 + (status2 + 1) * 3 + 2;
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
app.post('/brizeo/reportmoment/:momentid/:userid', function (req, res) {
	console.log("----------------API------13------------");
	var messageText = "";
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		console.log(snapshot.val());
		if (snapshot.exists()) {
			messageText = "User Id : " + snapshot.val().objectId + ", Name : " + snapshot.val().displayName+"["+snapshot.val().email+"]";
			momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
				console.log(snapshot.val());
				if (snapshot.exists()) {
					messageText += " reported " + "image '"+snapshot.val().momentDescription +"' [" + snapshot.val().momentsUploadImage + "] with id "+snapshot.val().objectId + " At time:- "+new Date();
					mailOptions.text = messageText;

					usersRef.child(snapshot.val().userId).once('value',function(sp){
						if(sp.exists()){
							messageText+=" uploaded by: " +sp.val().displayName +"["+sp.val().email+"]";
							console.log(messageText);
							mailOptions.text=messageText;

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
						}
					})

				} else
					res.status(404).end();
			});
		} else
			res.status(404).end();
	});
});

//14) GetNotificationsForUserId
app.get('/brizeo/notifications/:userid', function (req, res) {
	console.log("----------------API------14------------");
	notificationRef.orderByChild("receiveUser").equalTo(req.params.userid).once('value', function (snapshot) {
		var arynotification = []
		if (snapshot.exists()) {
			notifications = snapshot.val();
			console.log(notifications)

			async.forEach(notifications, function (notification, callback) {
				arynotification.push(notification);
				console.log(notification.sendUser);
				usersRef.child(notification.sendUser).once("value", function (snapshot) {
					if (snapshot.exists()) notification.user = snapshot.val();
					if (notification.pushType == "momentslike") {
						momentImagesRef.child(notification.momentsid).once("value", function (snapshot) {
							if (snapshot.exists()) {
								notification.moment = snapshot.val();
							}
							callback();
						});
					} else
						callback();
				});
			}, function (err) {
				arynotification = lodash.sortBy(arynotification, "updatedAt").reverse();
				res.send(arynotification);
			});
		} else
			res.send(arynotification);
	});

});

//15) GetUser
app.get('/brizeo/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------15------------");
	getUserStatus(req.params.userid1, req.params.userid2).then(function (status) {
		status1 = status;
		getUserStatus(req.params.userid2, req.params.userid1).then(function (status) {
			status2 = status;
			console.log("------status1--", status1, "-----status2---", status2, "------------");
			usersRef.child(req.params.userid2).once("value", function (snapshot) {
				if (snapshot.exists()) {
					var resstatus = status1 + (status2 + 1) * 3 + 2;
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
app.put('/brizeo/likemoments/:userid/:momentid', function (req, res) {
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
					if (snapshot.exists()) {
						moment = snapshot.val();
						registerNotification(req.params.userid, moment.userId, "momentslike", req.params.momentid);
						res.send(moment);
					}
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
						registerNotification(req.params.userid, moment.userId, "momentslike", req.params.momentid)
						res.send(moment);
					} else
						res.status(404).end();
				});
			}
		});

	});
});

//17) unlikeMoment
app.delete('/brizeo/likemoments/:userid/:momentid', function (req, res) {
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
app.delete('/brizeo/moments/:userid/:momentid', function (req, res) {
	console.log("----------------API------18------------");
	momentImagesRef.child(req.params.momentid).remove(function (error) {
		if (error)
			res.status(404).end();
		else{
			/*logic for removing norifications*/
				notificationRef.orderByChild("momentsid").equalTo(req.params.momentid).once('value', function (snapshot) {
					if(snapshot.exists()){
						for(key in snapshot.val()){
							notificationRef.child(key).remove();
							//eventsRef.ref.remove();
						}
						res.status(200).end();
					}
				})
			/*logic for removing notifications*/
		}
	});
});

//19) ReportUser
app.post('/brizeo/reportuser/:userid1/:userid2', function (req, res) {
	console.log("----------------API------19------------");
	var messageText = "";
	var currenttime = new Date().toISOString();
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
app.post('/brizeo/downloadevent/:userid1/:times', function (req, res) {
	console.log("----------------API------20------------");
	var messageText = "";
	var date = new Date().toISOString();
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
				matches.push(match);
				//matches.push(match);
			});
			var curlike = lodash.filter(matches, (match) => {
				return match.val().userB === req.params.userid2;
			});
			if (curlike.length == 1) {
				curlike[0].ref.set(appr);
				getUserStatus(req.params.userid2, req.params.userid1).then(function (status2) {
					var mutualStatus = status + (status2 + 1) * 3 + 2;
					// if (status2 == -1) mutualStatus = status + 2;
					// else if (status2 == 0) mutualStatus = status + 5;
					// else if (status2 == 1) mutualStatus = status + 8;
					console.log("lenth 1 for curlike"+mutualStatus);
					if (mutualStatus == 9){
						registerNotification(req.params.userid1, req.params.userid2, "newmatch", curlike[0].ref.key)
					}
					/*del code*/
						if(status==0){
							console.log("decline method:::::::",req.params.userid2);
							matchRef.orderByChild("userA").equalTo(req.params.userid2)
									 //.orderByChild("userB").equalTo(req.params.userid2)
									 .once("value",function(snapshot){
									 	if(snapshot.exists()){
									 		console.log("snapshot exists");
									 		for(key in snapshot.val()){
									 			var matchedMatch=snapshot.val()[key];
									 			console.log("maaaatched moment",matchedMatch);
									 			console.log("userid1",req.params.userid1);
									 			if(matchedMatch.userB==req.params.userid1){
									 				console.log("delete this match");
									 				matchRef.child(key).remove();
									 			}
									 		}	
									 	}else{
									 		console.log("no match found");
									 	}

									 });
						/*ends*/
					}else{
						console.log("Approve Wants to Match Notificationsss");
						var checkMatch=false;
						var aTOBcheck=false;
						var bToacheck=false;

						async.series([function(icb1){
								matchRef.orderByChild("userA").equalTo(req.params.userid1)
									.once('value',function(snapshot){
										if(snapshot.exists()){
											for(key in snapshot.val()){
												if(snapshot.val()[key].userB==req.params.userid2){
													aTOBcheck=true;
												}
											}
										}
										icb1();
								});
						  },
						function(icb2){
							matchRef.orderByChild("userA").equalTo(req.params.userid2)
									.once('value',function(snapshot){
										if(snapshot.exists()){
											for(key in snapshot.val()){
												if(snapshot.val()[key].userB==req.params.userid1){
													bToacheck=true;
												}
											}
										}
										icb2();
								});
						},function(icb3){
							if(aTOBcheck==false || bToacheck==false){
								console.log("not a match time to send notification 1st");
										if(aTOBcheck==false || bToacheck==false){
														console.log("not a match time to send notification 2nd");
														
														/*usr obj*/
														usersRef.child(req.params.userid1).once("value", function (sn) {
															if(sn.exists()){
																var notifyObj={};
																notifyObj["user"]=sn.val();
																notifyObj["isAlreadyViewed"]=false;
																notifyObj["pushType"]="wantsToMatch";
																notifyObj["createdAt"]= new Date().toISOString();
																notifyObj["receiveUser"]=req.params.userid2;
																notifyObj["sendUser"]=req.params.userid1;
																newnotiref = notificationRef.push();
																notifyObj.objectId=newnotiref.key;
																newnotiref.set(notifyObj);
																console.log("notification set");
															}
														});
														/*usr obj*/
													}

							}
						}]);
					}
					/*del code ends*/
					res.send(mutualStatus + "");
				}).catch(function (e) {
					console.log(e);
					res.status(500).end();
				});
				return;
			}
		}

		newmatchref = matchRef.push();
		newmatchref.set(appr, function (error) {
			if (error)
				res.status(404).end();
			else {
				getUserStatus(req.params.userid2, req.params.userid1).then(function (status2) {
					var mutualStatus = status + (status2 + 1) * 3 + 2;
					console.log("final:->"+mutualStatus);
					if (mutualStatus == 9){
						registerNotification(req.params.userid1, req.params.userid2, "newmatch", newmatchref.key)
					}
					/*del code*/
						if(status==0){
							console.log("decline method");
							matchRef.orderByChild("userA").equalTo(req.params.userid2)
									 //.orderByChild("userB").equalTo(req.params.userid2)
									 .once("value",function(snapshot){
									 	if(snapshot.exists()){
									 		for(key in snapshot.val()){
									 			var matchedMatch=snapshot.val()[key];
									 			if(matchedMatch.userB==req.params.userid1){
									 				console.log("delete this match");
									 				matchRef.child(key).remove();
									 			}
									 		}	
									 	}else{
									 		console.log("no match found");
									 	}

									 });
							}else{
							console.log("Approve::: Wants to Match Notificationsss");
												var checkMatch=false;
												var aTOBcheck=false;
												var bToacheck=false;

												async.series([function(icb1){
														matchRef.orderByChild("userA").equalTo(req.params.userid1)
															.once('value',function(snapshot){
																if(snapshot.exists()){
																	for(key in snapshot.val()){
																		if(snapshot.val()[key].userB==req.params.userid2){
																			aTOBcheck=true;
																		}
																	}
																}
																icb1();
														});
												  },
												function(icb2){
													matchRef.orderByChild("userA").equalTo(req.params.userid2)
															.once('value',function(snapshot){
																if(snapshot.exists()){
																	for(key in snapshot.val()){
																		if(snapshot.val()[key].userB==req.params.userid1){
																			bToacheck=true;
																		}
																	}
																}
																icb2();
														});
												},function(icb3){
													if(aTOBcheck==false || bToacheck==false){
														console.log("not a match time to send notification 2nd");
														var notifyObj={};
														/*usr obj*/
																	
														/*usr obj*/
														usersRef.child(req.params.userid1).once("value", function (sn) {
															if(sn.exists()){
																var notifyObj={};
																notifyObj["user"]=sn.val();
																notifyObj["isAlreadyViewed"]=false;
																notifyObj["pushType"]="wantsToMatch";
																notifyObj["createdAt"]= new Date().toISOString();
																notifyObj["receiveUser"]=req.params.userid2;
																notifyObj["sendUser"]=req.params.userid1;
																newnotiref = notificationRef.push();
																notifyObj.objectId=newnotiref.key;
																newnotiref.set(notifyObj);
																console.log("notification set");
															}
														});
														/*usr obj*/
														/*usr obj*/
													}
												}]);

							}
					/*del code ends*/
					console.log("before snedinf status");
					res.send(mutualStatus + "");
				}).catch(function (e) {
					console.log("error in status:->"+e);
					res.status(500).end();
				});
			}
		});
	});
}
//21) ApproveMatch
app.post('/brizeo/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------21------------");
	likeunlikeMatch(req, res, 1);
});

//22) Decline match
app.delete('/brizeo/match/:userid1/:userid2', function (req, res) {
	console.log("----------------API------22------------");
	likeunlikeMatch(req, res, 0);
});

Number.prototype.toRad = function () {
	return this * Math.PI / 180;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
	lat1 = Number(lat1);
	lon1 = Number(lon1);
	lat2 = Number(lat2);
	lon2 = Number(lon2);
	//console.log("-------==============",lat1,lon1,lat2,lon2);
	var R = 3959; // mile
	var dLat = (lat2 - lat1).toRad();
	var dLon = (lon2 - lon1).toRad();
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	//console.log("distance",d);
	return d;
}

//23) GetUsersForMatch
app.get('/brizeo/approveuserformatch/:userid', function (req, res) {
	console.log("----------------API------23------------");
	usersRef.child(req.params.userid).once("value", function (snapshot) {
		console.log("user exists");
		if (snapshot.exists()) {
			curuser = snapshot.val();
			console.log("req.params.userid"+req.params.userid.toString());
			preferencesRef.child(req.params.userid.toString()).once("value", function (snapshot) {
				console.log(snapshot.val());
				if (snapshot.exists()){
					console.log("assigning value");
					pref = snapshot.val();
				}else{
					console.log("assinging new pred");
					pref = newpref;
				}
				if (!pref.hasOwnProperty("searchLocation")) pref.searchLocation = curuser.currentLocation;
				console.log("pref",pref);
				distance = pref.maxSearchDistance;
				maxage = pref.upperAgeLimit;
				minage = pref.lowerAgeLimit;
				searchLocation = pref.searchLocation;
				var doNotIncludeThisUsers=[];
				doNotIncludeThisUsers.push(req.params.userid);
				/*Including users who are already matched with user*/
					matchRef.orderByChild("userA").equalTo(req.params.userid).once('value', function (snapshot) {
						if(snapshot.exists){
							for(key in snapshot.val()){
								doNotIncludeThisUsers.push(snapshot.val()[key].userB);
							}
						}
					});
				/*ends*/
				var aryuser = [];
				usersRef.once('value',function(snapshot){
					if(snapshot.exists()){
						otheruser = snapshot.val();
						async.forEach(otheruser,function(usr,callback){
							/*search criteriass*/
							var searchTest=false;
							if(usr.currentLocation){
								usr["distance"]=calculateDistance(usr.currentLocation["latitude"], usr.currentLocation["longitude"],searchLocation.latitude, searchLocation.longitude);
								searchTest=calculateDistance(usr.currentLocation["latitude"], usr.currentLocation["longitude"],searchLocation.latitude, searchLocation.longitude) < distance;
							}
								var minAgeTest=usr.age >= minage;
								var maxAgeTest=usr.age <= maxage;
								var genderTest=pref.genders.indexOf(usr.gender) != -1;
								var overAllTest=searchTest && minAgeTest && maxAgeTest && genderTest;
								if(overAllTest){
									console.log("usr founddddddddddddddddddd");
									if(doNotIncludeThisUsers.indexOf(usr.objectId)<0){
										aryuser.push(usr);
									}
								}
						},function(err){
							console.log("err called");
							aryuser=lodash.sortBy(aryuser,"distance");
							res.send(aryuser);
						});
						console.log(aryuser.length);
						aryuser=lodash.sortBy(aryuser,"distance");
						res.json(aryuser);
					}
				});


				/*
				matchRef.orderByChild("userB").equalTo(req.params.userid).once('value', function (snapshot) {
					var aryuser = [];
					if (snapshot.exists()) {
						async.forEach(snapshot.val(), function (matchrow, callback) {
							usersRef.child(matchrow.userA).once("value", function (snapshot) {
								console.log(snapshot.val());
								if (snapshot.exists()) {
									otheruser = snapshot.val();
									if (otheruser.age >= minage && otheruser.age <= maxage && pref.genders.indexOf(otheruser.gender) != -1 &&
										calculateDistance(otheruser.currentLocation.latitude, otheruser.currentLocation.longitude, searchLocation.latitude, searchLocation.longitude) < distance)
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
			*/	
			},function(err){
				console.log("error",err);
			});

		} else{
			console.log("not found status");
			res.sendStatus(404);
		}
	});
});

//24) GetMatchesForUser
app.get('/brizeo/approvematchforuser/:userid', function (req, res) {
/*	
	console.log("----------------API------24------------");
	console.log("userB matching id is ",req.params.userid);
	matchRef.orderByChild("userB").equalTo(req.params.userid).once('value', function (snapshot) {
		var aryuser = [];
		var cntr=0;
		console.log("inside match");
		if (snapshot.exists()) {
			async.forEach(snapshot.val(), function (matchrow, callback) {
				console.log("inside async");
				cntr++;
				if(matchrow.status!==0){
					console.log("inside status");
						usersRef.child(matchrow.userA).once("value", function (sn) {
							if (sn.exists()){
								console.log("pushe");
								aryuser.push(sn.val());
							}
							/*sending back response*
							console.log("cntr",cntr);
							console.log("size",lodash.size(snapshot.val()));
							if(cntr==lodash.size(snapshot.val())){
								res.json(aryuser);
							}

							/*sending back response ends
						});
			 }
			}, function (cb) {
				console.log("1 semnding response");
				res.json(aryuser);
			});
		} else{
			console.log("inside error");
			res.send(aryuser);
		}
	});
*/
	console.log("----------------API------24------------");
	console.log("userB matching id is ",req.params.userid);
	var myMatches=[];
	var usersWhoMatchedWithMe=[];
	var usersIMatchedWith=[];
	async.series([function(icb1){
		var cntr=0;
		matchRef.orderByChild("userB").
				equalTo(req.params.userid).once('value', function (snapshot) {
					if (snapshot.exists()) {
						async.forEach(snapshot.val(), function (matchrow, callback) {
						console.log("inside async");
						cntr++;
						if(matchrow.status!==0){
							usersWhoMatchedWithMe.push(matchrow.userA);
						 }

						 if(cntr==lodash.size(snapshot.val())){
								icb1();
						  }

					});
				}else{
					icb1();
				}
		})
	},function(icb2){
		console.log("inside method2");
		var cntr2=0;
		matchRef.orderByChild("userA").
				equalTo(req.params.userid).once('value', function (snapshot) {
					if (snapshot.exists()) {
						async.forEach(snapshot.val(), function (matchrow, callback) {
						console.log("inside async");
						cntr2++;
						if(matchrow.status!==0){
							usersIMatchedWith.push(matchrow.userB);
						 }
						 console.log("cntr2",cntr2);
						 console.log("size",lodash.size(snapshot.val()));
						 if(cntr2==lodash.size(snapshot.val())){
								icb2();
						  }
					});
				}else{
					icb2();
				}

			})},function(icb3){
				console.log("inside method 3");
				console.log(usersIMatchedWith);
				console.log(usersWhoMatchedWithMe);
				var myMatchesId=intersection_destructive(usersIMatchedWith,usersWhoMatchedWithMe);
				console.log(myMatchesId);
				var finalCntr=0;
				if(myMatchesId.length==0){
					res.json(myMatches);
				}
				async.forEach(myMatchesId,function(match,callback){
					usersRef.child(match).once("value", function (sn) {
						if(sn.exists()){
							myMatches.push(sn.val());
						}
						/*returning response strts*/
						finalCntr++;
						console.log("finalCntr",finalCntr);
						console.log("myMatches",myMatchesId.length);
						if(finalCntr==myMatchesId.length){
							res.json(myMatches);
						}

						/*returning response ends*/
					});
				})

			}
		])
});

//25) GetCountriesForUser
app.get('/brizeo/countries/:userid', function (req, res) {
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
app.put('/brizeo/countries/:userid', function (req, res) {
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
app.delete('/brizeo/countries/:userid', function (req, res) {
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

//28) Get a event by userid
app.get('/brizeo/events/:userid', function (req, res) {
	console.log("----------------API------28------------");
	eventsRef.orderByChild("ownerUser").equalTo(req.params.userid).once("value", function (snapshot) {
		var events = [];
		if (snapshot.exists()) {
			events = snapshot.val();




			events = lodash.sortBy(events, "startDate").reverse();

			console.log(events);
			usersRef.child(req.params.userid).once("value", function (snapshot) {
				if (snapshot.exists()) {
					events.forEach(function (event) {
						event.user = snapshot.val();
					});
				}
				res.send(events)
			});
		} else
			res.send(events);
	});
});

//29) Get a moment by id
app.get('/brizeo/moments/:momentid', function (req, res) {
	console.log("----------------API------29------------");
	momentImagesRef.child(req.params.momentid).once("value", function (snapshot) {
		if (snapshot.exists())
			res.send(snapshot.val());
		else
			res.status(404).end();
	});
});

//30 Update moment
app.put('/brizeo/moments/:momentid', function (req, res) {
	console.log("----------------API------30------------");
	momentImagesRef.child(req.params.momentid).update(req.body.newmoment, function (error) {
		if (error)
			res.sendStatus(404);
		else
			res.sendStatus(200);
	});
});

//31 Get Mutual friends
app.get('/brizeo/mutual_friends/:userid/:accessToken', function (req, appRes) {
	var accessToken = req.params.accessToken;
	var userid = req.params.userid;
	FB.setAccessToken(accessToken);
	FB.api(userid + '?fields=context.fields(mutual_friends)', function (res) {
		if (!res || res.error) {
			console.log(!res ? 'error occurred' : res.error);
			appRes.sendStatus(500);
			return;
		}
		var contextId = res.context.id;
		if (contextId) {
			FB.api(contextId + '/all_mutual_friends', function (response) {
				mutual_friends = response;
				appRes.json(mutual_friends.data);
			});
		} else {
			appRes.json({ 'error': res, 'code': 200 });
		}
	});
})

//32 save new event data
app.post('/brizeo/events', function (req, res) {
	console.log("----------------API------32------------");
	async.forEach(req.body.newevents, function (newevent, callback) {
	/*Step 1: check if event exists, if yes then remove event*/
		console.log("facebookId",newevent.facebookId);
		eventsRef.orderByChild("facebookId").
			equalTo(newevent.facebookId.toString()).once("value", function (snapshot){
				if(snapshot.exists()){
					console.log("event foundddddddddd");
					for(key in snapshot.val()){
						eventsRef.child(key).remove();
						console.log("1. removed eventttttttt");
						//eventsRef.ref.remove();
					}
				}
						/*Step 2 : Adding single event starts*/
						var neweventref = eventsRef.push();
						newevent.objectId = neweventref.key;
						console.log(newevent.startDate);
						/*Expiry date removAL code*/
							var today = new Date();
							var todayIOS = today.toISOString();
							var d1 = new Date(todayIOS);
						//if(newevent.startDate.getTime() > d1.getTime()){
							/*Expiry date removal code*/
							neweventref.set(newevent, function (error) {
								callback();
							});
					   //}	
					 /*Adding single event ends*/
				
			});
	}, function (err) {
		res.sendStatus(200);
	});
});

//33 Update notification
app.put('/brizeo/notifications/:notificationid', function (req, res) {
	console.log("----------------API------33------------");
	notificationRef.child(req.params.notificationid).update(req.body.newnotification, function (error) {
		if (error)
			res.sendStatus(404);
		else
			res.sendStatus(200);
	});
});

//34) getEvents
app.put('/brizeo/allevents/:sort', function (req, res) {
	console.log("----------------API------34 get all Events------------");
	var searchedevents = [];
	var sortstr = "distance";
	if (req.params.sort == "popular") {
		sortstr = "attendingsCount";
	}
	eventsRef.once("value", function (snapshot) {
		for (key in snapshot.val()) {
			event = snapshot.val()[key];
			var distance = calculateDistance(event.latitude, event.longitude, req.body.lat, req.body.lon);
			if (distance <= 50) {
				event.distance = distance;
				searchedevents.push(event);
			}
		}
		searchedevents=lodash.sortBy(searchedevents, sortstr);
		if (sortstr == "attendingsCount"){
			console.log("trying to reverse");
			searchedevents = searchedevents.reverse();
		}

		async.forEach(searchedevents, function (event, callback) {
			if (event.hasOwnProperty("ownerUser")) {
				usersRef.child(event.ownerUser).once("value", function (snapshot) {
					if (snapshot.exists()) event.user = snapshot.val();
					callback();
				});
				/**/		var fbids=event.attendingsIds;
							var validUsers=[];
							async.forEach(fbids, function (fbid, callback) {
				                usersRef.orderByChild("facebookId").equalTo(fbid.toString()).once('value', function (snapshot) {
				                        if (snapshot.exists()){
				                        	console.log("matchhhhhhhhhhhh");
				                        		for(key in snapshot.val()){
				                             	   validUsers.push(snapshot.val()[key]);
				                            }
				                        }
				                        callback();
				                });
				        }, function (err) {
				                
				        });
				/**/
			} else
				callback();
		}, function (err) {
			res.send(searchedevents);
		});
	})
});

	//35) get valid fbusers
app.post('/brizeo/fbusers', function (req, res) {
        console.log("----------------API------35 Valid FB Users------------");
        var fbids = req.body.fbids;
        var validusers = [];
        async.forEach(fbids, function (fbid, callback) {
                usersRef.orderByChild("facebookId").equalTo(fbid).once('value', function (snapshot) {
                        if (snapshot.exists()){
                        		for(key in snapshot.val()){
                             	   validusers.push(snapshot.val()[key]);
                            }
                        }
                        callback();
                });
        }, function (err) {
                res.send(validusers);
        });
});

//36)GetMatchedEventsForUserWithId 
/*
THis method returns events matched by userId.
*/
app.put('/brizeo/events-by-user/:userId/:sort',function(req,res){
	var userId = req.params.userId;
	
	var sort=req.params.sort;
	var lat=req.body.lat;
	var lon=req.body.lon;

	var sortstr = "distance";
	if (req.params.sort == "popular") {
		sortstr = "attendingsCount";
	}

	var eventCounter=0;		
		usersRef.child(userId).once("value", function (snapshot) {
			if(snapshot.exists()){
				//var userId=snapshot.val().objectId;
				var facebookId=snapshot.val().facebookId;
				//find events: keys to match in facebookId or AttendingId's
				var userInvolvingEvents=[];
				console.log("facebookId",facebookId);
				//sampleId :"1996819877208350"
					async.series([function(callback){
						console.log("in first taskl");
						/*Adding Events Where user is attending the event*/
                        eventsRef.once('value',function(snapshot){
                        	var eventsArr=snapshot.val();
                        	async.forEach(eventsArr,function(event,callback){
                        	if(event.attendingsIds.indexOf(facebookId.toString())>0){
							  	console.log("attending event found");
							  	/*Attach Distance here*/
							  		event["distance"]=calculateDistance(event.latitude,event.longitude,req.body.lat,req.body.lon);
							  	/*Ends*/
							  	userInvolvingEvents.push(event);
							  }
                        	},function(err){

                        	});
                        	callback(null,1);
                        })
                      /*Adding Events Where user is attending the event Endssss*/
					},function(callback){
						console.log("in second task");
						 /*Adding Events Where user is Owner User Starts*/
							eventsRef.orderByChild("ownerUser").
										equalTo(userId.toString()).once("value", function (snapshot){
								if(snapshot.exists()){
									console.log("events Exist where user is ownner.");
									if (snapshot.exists()){
		                        		for(key in snapshot.val()){
		                        			var eventObj=snapshot.val()[key];
		                        		   eventObj["distance"]=calculateDistance(eventObj.latitude,eventObj.longitude,req.body.lat,req.body.lon);	
		                             	   userInvolvingEvents.push(eventObj);
		                            	}
		                        	}
									//res.json({"eventsUserInvolved":userInvolvingEvents,"status":200});
								}
								callback(null,2);
							},function(errorObject){
								console.log("errorObject",errorObject);
							});
					/*Adding Events Where user is Owner User Starts*/
					},function(callback){
						//adding location name.
						async.forEach(userInvolvingEvents,function(event,callback){
							Wreck.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+event.latitude+","+event.longitude+"&sensor=true",
								(err,Wres,payload)=>{
									var replaceIndex=userInvolvingEvents.indexOf(event);
								if(JSON.parse(payload.toString()).results[0]){
									var addr=JSON.parse(payload.toString()).results[0].formatted_address;
								}else{
									var addr='';
								}
								event.location=addr;
								userInvolvingEvents[replaceIndex]=event;
								console.log("Replacedddd");
								eventCounter++;
								if(eventCounter === userInvolvingEvents.length) {
									/*filter*/
									console.log(sortstr);
									userInvolvingEvents=lodash.sortBy(userInvolvingEvents, sortstr);
									if (sortstr == "attendingsCount"){
										userInvolvingEvents = userInvolvingEvents.reverse();
									}
									userInvolvingEvents=lodash.uniqBy(userInvolvingEvents,'facebookId');
									/*fultering logic ends.*/
									/*add user obj starts*/
										var finalCounter=0;
										async.forEach(userInvolvingEvents,function(event,callback){
												usersRef.child(event.ownerUser).once("value", function (snapshot) {
												finalCounter++;
												if (snapshot.exists()) {
													console.log("final push");
													event["user"] = snapshot.val();
												}
												if(finalCounter == userInvolvingEvents.length){
													console.log("before sending");
													res.json(userInvolvingEvents);
												  }
											});
										});
							    }
							})
						},function(err){
							console.log("Error getting location from geo map",err);
							res.json(userInvolvingEvents);
						});
						callback(null,3);
					}]/*,function(){
						res.json({"eventsUserInvolved":userInvolvingEvents,"status":200});
					}*/);
			}else{
				res.json({"status":404,"statusText":"No Users Exists With the specified User Id"});
			}
		});
});

/*37 Delete User.*/
app.get('/brizeo/delete-user/:userId',function(req,res){
	var userId = req.params.userId;
	//delete moments pics.
	async.series([function(callback){
			momentImagesRef
				.orderByChild("ownerUser")
				.equalTo(userId.toString())
				.once("value", function (snapshot){

				 if(snapshot.exists()){
				 	for(key in snapshot.val()){
				 		//delete moment image ref.
				 		console.log("removing moments");
				 		momentImagesRef.child(key).remove();
				 	}
				 }
				});
		callback();
	 },
		function(callback){
				usersRef.child(req.params.userId).once("value", function (snapshot) {

				 if(snapshot.exists()){
				 		//delete moment image ref.
				 		usersRef.child(snapshot.val()["objectId"]).remove();
				 }	
				});
				callback();
				res.json({"success":true,"status":200});

	}])

});


/*38 Get Matched Events for user : Events of User's Matches Where user's events are not there.*/
app.put('/brizeo/events-by-users-matches/:userId/:sort',function(req,res){
	var userId = req.params.userId;
	
	var sort=req.params.sort;
	var lat=req.body.lat;
	var lon=req.body.lon;

	var sortstr = "distance";
	if (req.params.sort == "popular") {
		sortstr = "attendingsCount";
	}

	if(req.params.sort=="earliest"){
		sortstr="startDate";
	}
	var includeThisUsers=[];
	var getFBIdsFromUserIds=[];
	var userInvolvingEvents=[];
	var usersIMatchedWith=[];
	var usersWhoMatchedWithMe=[];
	console.log("=================================================38=========================================");
	console.log("req.body.userid",req.params.userId);
	console.log("req.params.sort",req.params.sort);
	console.log("req.body.lat",req.body.lat);
	console.log("req.body.lon",req.body.lon);
	console.log("=================================================38============================================");

	 matchRef.orderByChild("userA").equalTo(req.params.userId)
       .once("value",function(snapshot){
			if(snapshot.exists()){
				async.series([function(callback){
					for(key in snapshot.val()){
						usersIMatchedWith.push(snapshot.val()[key].userB);
				    }
				   callback(null,includeThisUsers);
				},function(icb2){
					console.log("step 1.1",req.params.userId);
					 matchRef.orderByChild("userB").equalTo(req.params.userId).once("value",function(snapshot){
					 	if(snapshot.exists()){
					 		var cntr=0;
					 		for(key in snapshot.val()){
					 			cntr++;
					 			console.log("snapshot.val()[key].userA",snapshot.val()[key].userA);
								usersWhoMatchedWithMe.push(snapshot.val()[key].userA);
								if(cntr==lodash.size(snapshot.val())){
									icb2();
								}
				    		}
					 	}else{
					 		res.json(userInvolvingEvents);
					 	}
					 });
				},function(icb3){
					console.log("u i m with",usersIMatchedWith);
					console.log("u w m with me",usersWhoMatchedWithMe);
					includeThisUsers=intersection_destructive(usersIMatchedWith,usersWhoMatchedWithMe);
					console.log("includeThisUsers.length",includeThisUsers.length);
					icb3();
				},function(callback){
					console.log("step 2");
					var count=0;
					async.forEach(includeThisUsers,function(usr,cb){
						usersRef.child(usr).once("value", function (snapshot) {
							count++;
							getFBIdsFromUserIds.push(snapshot.val().facebookId);
							console.log("pushed");
							if(count==includeThisUsers.length){
								callback(null,getFBIdsFromUserIds);
							}
						});
					},function(err){
						console.log("err",err);
					})},
				function(callback){
					console.log("step3");
					/*events logic
						Part A : Attending Id's
					*/
					eventsRef.once('value',function(snapshot){
                        	var eventsArr=snapshot.val();
                        	var cnt=0;
                        	var eventArrCnt=lodash.size(eventsArr);
                        	async.forEach(eventsArr,function(event,icB1){
                        		cnt++;
                        		console.log("inside eventsArr");
                        		async.forEach(getFBIdsFromUserIds,function(fbId,iCB2){
                        			if(event.attendingsIds.indexOf(fbId)>0){
                        				console.log("inside fb users :: attending event found");
									  	event["distance"]=calculateDistance(event.latitude,event.longitude,req.body.lat,req.body.lon);
									  	userInvolvingEvents.push(event);
		                        	}
                        		});
                        		if(cnt==eventArrCnt){
									  	callback(null,userInvolvingEvents);
									}	
                        	});
 					});
 					/*Events Logic*/
				},function(cb){
					console.log("step 4");
					var cntr=0;
					async.forEach(includeThisUsers,function(usrId,icB3){
							eventsRef.orderByChild("ownerUser").
										equalTo(usrId.toString()).once("value", function (snapshot){
								if(snapshot.exists()){
									console.log("events Exist where user is ownner.");
									if (snapshot.exists()){
		                        		for(key in snapshot.val()){
		                        			var eventObj=snapshot.val()[key];
		                        		   eventObj["distance"]=calculateDistance(eventObj.latitude,eventObj.longitude,req.body.lat,req.body.lon);	
		                             	   userInvolvingEvents.push(eventObj);
		                            	}
		                        	}
								}
								cntr++;
								if(cntr==includeThisUsers.length){
								   cb(null,userInvolvingEvents);
							    }	
							});		
					});
				},function(callback){
						//adding location name.
						console.log("step 5");
						var eventCounter=0;
						console.log("userInvolvingEvents",userInvolvingEvents);
						async.forEach(userInvolvingEvents,function(event,ib1){
							Wreck.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+event.latitude+","+event.longitude+"&sensor=true",
								(err,Wres,payload)=>{
									var replaceIndex=userInvolvingEvents.indexOf(event);
								if(JSON.parse(payload.toString()).results[0]){
									var addr=JSON.parse(payload.toString()).results[0].formatted_address;
								}else{
									var addr='';
								}
								event.location=addr;
								userInvolvingEvents[replaceIndex]=event;
								eventCounter++;
								if(eventCounter === userInvolvingEvents.length) {
									/*filter*/
									console.log(sortstr);
									userInvolvingEvents=lodash.sortBy(userInvolvingEvents, sortstr);
									if (sortstr == "attendingsCount"){
										userInvolvingEvents = userInvolvingEvents.reverse();
									}
									userInvolvingEvents=lodash.uniqBy(userInvolvingEvents,'facebookId');
									/*fultering logic ends.*/
									/*add user obj starts*/
										var finalCounter=0;
									console.log("userInvolvingEventsLength"+userInvolvingEvents.length);
									async.forEach(userInvolvingEvents,function(event,ib2){
												usersRef.child(event.ownerUser).once("value", function (snapshot) {
												finalCounter++;
												if (snapshot.exists()) {
													console.log("final push");
													event["user"] = snapshot.val();
												}
												if(finalCounter == userInvolvingEvents.length){
													console.log("before sending");
											//adding filter on date.
													res.json(userInvolvingEvents);
												  }
											});
										});
							    }
							})
						},function(err){
							console.log("Error getting location from geo map");
							res.json(userInvolvingEvents);
						});
					}
				]);
	       }else{
	       		res.json(userInvolvingEvents);
	       	    //res.sendStatus(404);
	       }
     })
});       

/*38 ends*/


/*utitlies function :if some user approved other user, and they are not already matched between each other*/
function checkIfAlreadyMatched(usrId1,usrId2){
	console.log("checkIfAlreadyMatched");
	 /*
	 matchRef.orderByChild("userA").equalTo(usrId1).once('value',function(snapshot){
	 	if(snapshot.exists()){
	 		console.log("snapshot exists");
	 		for(key in snapshot.val()){
						if(snapshot.val()[key].userB==usrId2){
							console.log("return true");
							return true;
						}else{
							console.log("return false");
							return false;
						}
				}
	 	}else{
	 		console.log("no val found");
	 		return false;
	 	}
	 });
*/
}
/*utilities functions*/

/*intesection array*/
function intersection_destructive(a, b)
{
  var result = [];
	for(each in a){
  	if(b.indexOf(a[each])>=0){
      result.push(a[each]);
    }
  }
  return result;
}


function getPaginatedItems(items, page) {
	var page = page || 1,
	    per_page = 35,
	    offset = (page - 1) * per_page,
	    paginatedItems = lodash.drop(items, offset).slice(0, per_page);
	return paginatedItems;
}

module.exports = app;

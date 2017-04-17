var cron = require('node-cron');
var firebase = require('firebase-admin');
var db = firebase.database();
var eventsRef = db.ref("/Events");
var lodash = require('lodash');



 
cron.schedule('30 * * * * *', function(){
  console.log("running events Scheduler");
  eliminateExpiredEvents();
});


function eliminateExpiredEvents(){
      eventsRef.once('value',function(snapshot){
              var eventsArr=snapshot.val();
              var eventArrCnt=lodash.size(eventsArr);
              console.log("eventsArrCnt",eventArrCnt);
              async.forEach(eventsArr,function(event,icB1){
                if(Date.parse(event.startDate)-Date.parse(new Date())<0){
                  eventsRef.child(event.objectId).remove();
                  console.log("Event is expired");
                }
              });
          });
}
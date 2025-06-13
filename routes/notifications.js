
const router = require('express').Router();

// var fcm = require('fcm-notification');
// var FCM = new fcm("./constants/privatekey.json");

// let Notification = require('../models/notification.model');

// router.route('/add').post((req, res) => {
//   const newCategory = new Notification({
//     label  :  req.body.label,
//     description  :  req.body.description || null,
//   });

//   newCategory.save()
//   .then(category => res.json(category))
//   .catch(err => res.status(400).json('Error: ' + err));
  
// });



// router.route('/sendNotif').post((req, result) => {

//     var Tokens = [ 'emLTP5vjQOOdtUAuch2EAs:APA91bGKSi4KG0mdhKwD_DbEg7aD2wY2Q5HvEfWDA57UErVrF76CHRYHAPu9BL4zPNyG7UwPVXZvdE3MdH9ILLz8zz-_K69cZOGdSWQXynvkOeq6At-V8xX1RlFJbkLZyQRr97_RbpET', 'emLTP5vjQOOdtUAuch2EAs:APA91bGKSi4KG0mdhKwD_DbEg7aD2wY2Q5HvEfWDA57UErVrF76CHRYHAPu9BL4zPNyG7UwPVXZvdE3MdH9ILLz8zz-_K69cZOGdSWQXynvkOeq6At-V8xX1RlFJbkLZyQRr97_RbpET', 'emLTP5vjQOOdtUAuch2EAs:APA91bGKSi4KG0mdhKwD_DbEg7aD2wY2Q5HvEfWDA57UErVrF76CHRYHAPu9BL4zPNyG7UwPVXZvdE3MdH9ILLz8zz-_K69cZOGdSWQXynvkOeq6At-V8xX1RlFJbkLZyQRr97_RbpET'];

//     var callbackLog = function (sender, err, res) {
//         result.send({sended: 'ok'})
//         console.log("\n__________________________________")
//         console.log("\t"+sender);
//         console.log("----------------------------------")
//         console.log("err="+err);
//         console.log("res="+res);
//         console.log("----------------------------------\n>>>");
//     };

    
//     // let message = req.body.message;  
//     // let from = req.body.fromBroadcaster; 
//     // let to = req.body.toBroadcaster; 
//     // let systemNotif = req.body.systemNotif; 
//     // let pictNotif = req.body.pictNotif; 
//     // let linkNotif = req.body.linkNotif; 

//     let message = 'view my broadcast';
//     let pictNotif = 'https://gadgetonus.com/wp-content/uploads/2022/04/22-96x96.jpg'; 
//     let linkNotif = 'fantka://live/0000'; 

//     var sendedMessage = {
//         data: {
//             url: linkNotif,
//         },
//         notification:{
//             title : 'creative, im waiting for you!',
//             body : message,
//             image: pictNotif,
//         },
//         webpush: {
//             fcmOptions: {
//               link: linkNotif
//             }
//         },

//     };

//     FCM.sendToMultipleToken(sendedMessage, Tokens, function(err,res){
//         callbackLog('sendOK',err,res);
//     });

// });




module.exports = router;
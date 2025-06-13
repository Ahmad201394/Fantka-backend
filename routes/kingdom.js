const router = require('express').Router();
var path = require('path')
let Followers = require('../models/followers.model');
let Broadcaster = require('../models/brodcaster.model');
let Kingdom = require('../models/kingdom.model');
let famRequest = require('../models/famRequest.model');
let ChatMessage = require('../models/messages.model');
let kingdomTask= require('../models/kingdomtask.model');
let kingdomTaskTransaction = require('../models/kingdomtasktransaction.model');
let GiftTransaction = require('../models/gifttransaction.model');
let RechargeTransaction = require('../models/rechargetransaction.model');

const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token');
const uniqid = require('uniqid');

let moment = require('moment');

const exImagesUrl = 'http://164.92.181.219:5005/static/uploads/';

var ObjectId = require('mongoose').Types.ObjectId; 
let multer = require("multer");

const Storage = multer.diskStorage({
    destination(req, file, callback){
      callback(null, 'public/uploads/kingdoms/');
    },
    filename(req, file, callback){
      callback(null,"king-" + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({storage: Storage, limits: {fileSize: 1000000}});

const appID = process.env.AGORA_APPID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
const uid = 0;
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600;

const getToken = () =>
{
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const channelName = process.env.PREFIX + uniqid();
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    return ({channel : channelName, token: token})
}

const updateBroadcasterKingdom = (idBroadcaster) =>
{
    Broadcaster.updateOne({_id: ObjectId(idBroadcaster)},
    { $set: 
        { 
          "settings.idKingdom" : '',
        }
    })
    .then(req => { 
            const r = {error: false, message : 'SELECTED_KINGDOM_UPDATED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));
}


router.route('/getOurKingdom').post((req, res) => {

    var idBroadcaster = req.body.idBroadcaster;
    var type = req.body.type;

    Kingdom.find({ owner: ObjectId(idBroadcaster), kingdomType: type }, {kingdomName : 1, kingdomPicture : 1, kingdomDescription : 1, kingdomType : 1 })
    .then(kingdoms => res.json(kingdoms))
      .catch(err => res.status(400).json('Error: ', err));

});

router.route('/getJoinedKingdom').post((req, res) => {

    var idBroadcaster = req.body.idBroadcaster;
    var type = req.body.type;

    Kingdom.find({ "users.user" : ObjectId(idBroadcaster), kingdomType: type }, {kingdomName : 1, kingdomPicture : 1, kingdomDescription : 1, kingdomType : 1, owner: 1 })
    .then(kingdoms => res.json(kingdoms))
    .catch(err => res.status(400).json('Error: ', err));

});

router.route('/getCurrentKingdom').post((req, res) => {

    var idCurrentKingdom = req.body.idCurrentKingdom;

    Kingdom.findOne({ _id : ObjectId(idCurrentKingdom)})
    .then(kingdoms => res.json({ kingdomName : kingdoms.kingdomName }))
    .catch(err => res.status(400).json('Error: ', err));

});


router.route('/add').post((req, res) => {

    newKingdom = new Kingdom( {
        kingdomName :  req.body.kingdomName,
        kingdomPicture : 'kingdomdefault.png',
        kingdomDescription : req.body.kingdomDescription,
        kingdomType : req.body.kingdomType,
        owner : req.body.owner,
        maxUsers : req.body.maxUsers,
        maxAdmins : req.body.maxAdmins,
        users : [ { user : req.body.owner, level : 0} ]
    });

    newKingdom.save()
    .then(kingdom => { 
            const r = {idKingdom : kingdom._id, data : kingdom, message : 'KINGDOM_CREATED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/editFam').post((req, res) => {

    let idKingdom = req.body.idKingdom;
    let data = {
        
        kingdomName :  req.body.kingdomName,
        kingdomDescription : req.body.kingdomDescription,
       
    };

    Kingdom.updateOne({_id: ObjectId(idKingdom)}, data)
    .then(kingdom => { 
            const r = {error : false, message : 'KINGDOM_EDITED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));
});



router.post('/addkingdomPicture', upload.single('image'), function(req, res, next){
    var idKingdom = req.body.idKingdom;
  
    let data = { kingdomPicture : req.file.filename };

    Kingdom.updateOne({_id: ObjectId(idKingdom)}, data)
    .then(kingdom => {
                res.json(kingdom);
            }
        )
    .catch(err => res.status(400).send((err).toString()));
  });
  

  router.route('/getKingdomInfos').post((req, res) => {
    const idKingdom   = req.body.idKingdom;
    Promise.all([
    Kingdom.aggregate( [
        {
            $match : {
              _id: ObjectId(idKingdom)
            }
          },
          { $unwind : "$users" },
        {
            $lookup: {
               from: "broadcasters",
               localField: "users.user",    
               foreignField: "_id", 
               as: "usersData"
            }
         },

         {$unwind: {
            path: '$usersData',
          }}, 
          

        { $project: { 
            "_id" :  "$usersData._id",
            "nickname" :  "$usersData.nickname",
            "avatar" :  "$usersData.picture",
            "level" : "$users.level"
         } }
        
     ] ),

     Kingdom.aggregate( [
        {
            $match : {
              _id: ObjectId(idKingdom)
            }
          },

          {
            $lookup: {
               from: "broadcasters",
               localField: "owner",    
               foreignField: "_id", 
               as: "ownerData"
            }
         },
         { $unwind: "$ownerData" },
        { $project: { 
            "kingdomName" : "$kingdomName",
            "kingdomDescription" : "$kingdomDescription",
            "kingdomPicture" : "$kingdomPicture",
            "ownerId" : "$ownerData._id",
            "ownerNickname" : "$ownerData.nickname",
            "ownerAvatar" : "$ownerData.picture",
            "kingdomType" : "$kingdomType",
            }  
         } 
        
     ] ),


    ])
     .then(([us, king]) => res.json({users : us, fam: king[0] }))
    .catch(err => {
        res.status(400).send((err).toString())});
});



/* --------- Audio Beam ------------------------------------------------- */

router.route('/getKingdomBeam').post((req, res) => {
    const idKingdom   = req.body.idKingdom;

    Kingdom.findOne({ _id : ObjectId(idKingdom) })
    .then(fl => {
        if (fl.audioBeam && fl.audioChannel && fl.audioToken ) { res.json({beam : fl.audioBeam, audioChannel: fl.audioChannel, audioToken: fl.audioToken }) } else { res.json({beam : [], audioChannel: '', audioToken: '' }) };
    })
    .catch(err => {
        res.status(400).send((err).toString())});
});



router.route('/addAudioBroadcasterInit').post((req, res) => {
    const idKingdom   = req.body.idKingdom;
    let guestbeamData = {
        audioChannel : req.body.audioChannel,
        audioToken : req.body.audioToken,
        $push : { 
            audioBeam : {
                userId: req.body.userId,
                name : req.body.name,
                avatar : req.body.avatar,
                level : req.body.audioLevel,
                liveUid : req.body.liveUid,
                isMuted : req.body.isMuted
            }
        }
    }

    Kingdom.updateOne({_id: ObjectId(idKingdom)}, guestbeamData)
    .then(broadcaster => {res.json(broadcaster)})
    .catch(err => res.status(400).send((err).toString()));    
});

router.route('/addAudioBroadcaster').post((req, res) => {
    const idKingdom   = req.body.idKingdom;
    let guestbeamData = {
        $push : { 
            audioBeam : {
                userId: req.body.userId,
                name : req.body.name,
                avatar : req.body.avatar,
                level : req.body.audioLevel,
                liveUid : req.body.liveUid,
                isMuted : req.body.isMuted
            }
        }
    }

    Kingdom.updateOne({_id: ObjectId(idKingdom)}, guestbeamData)
    .then(broadcaster => {res.json(broadcaster);})
    .catch(err => res.status(400).send((err).toString()));    
});

router.route('/removeAudioBroadcaster').post((req, res) => {
    const idKingdom   = req.body.idKingdom;
    const idGuestAudio = req.body.idGuestAudio;
    Kingdom.updateOne( { _id: ObjectId(idKingdom) }, { $pull: { audioBeam: { userId: idGuestAudio } } } )
    .then(kg => {res.json(kg);})
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/removeAudioBroadcasterUid').post((req, res) => {
    const idKingdom   = req.body.idKingdom;
    const uid = req.body.uid;
    Kingdom.updateOne( { _id: ObjectId(idKingdom) }, { $pull: { audioBeam: { liveUid: uid } } } )
    .then(kg => {res.json(kg);})
    .catch(err => res.status(400).send((err).toString()));
});




router.route('/getFollowers').post((req, res) => {
    const idKingdom   = req.body.idKingdom;
    const idBroadcaster   = req.body.idBroadcaster;

    Followers.aggregate( [
        { "$addFields": { "idSelKingdom" : idKingdom } },
        {
            $match : {
                idFollower: ObjectId(idBroadcaster)
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idFollowed",
                foreignField: "_id",
                as: "followerData"
            }
        },
        {
            $unwind : "$followerData"
        },
        {
            $lookup:
            {
                from: "kingdoms",
                localField: "idFollowed",
                foreignField: "users.user",
                as: "kdata"
            }
        },
        
        { "$addFields": { "isSelected" : false } },

        { "$addFields" : { "sKingdom"  :  
            {$cond:[
                {
                    $gt:[
                        {
                            $size:  {"$ifNull": [ {$setIntersection:["$kdata._id", [ObjectId(idKingdom)]]}, [] ]}
                        }
                        ,0
                    ]
                },
                true,
                false
            ]}
        } },
        
        { $project: { 
            idFollower : 0,
            idFollowed : 0,
            idLiveStream : 0,
            updatedAt : 0,
            followerData : {
               
                idDealer: 0,
                idBroadcaster: 0,
                biography: 0,
                phone: 0,
                localphone: 0,
                email: 0,
                sex: 0,
                birthday: 0,
                stats: 0,
                signupPosition: 0,
                password: 0,
                status: 0,
                fbID: 0,
                pictures: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                country: 0,
                countryCode: 0,
                settings: 0,
                pushToken : 0
            },
            kdata : 0
           
         } },
         { $sort : { createdAt : -1 } },
    ])
    .then(fl => res.json(fl))
    .catch(err => {
        res.status(400).send((err).toString())});

});

router.route('/sendFamRequest').post((req, res) => {
    const idFam   = req.body.idFam;
    const famName   = req.body.famName;
    const requestFromId   = req.body.requestFromId;
    const requestFromAvatar   = req.body.requestFromAvatar;
    const requestFromName = req.body.requestFromName;
    const message = req.body.message;
    const sendedUser = req.body.sendedUser;
    const fromAdmin = req.body.fromAdmin;
    const reqType = req.body.reqType

    const data = sendedUser.map((info, index) => 
        ({ 
            idFam : idFam,
            famName : famName,
            user : info,
            from : requestFromId,
            fromAvatar :  requestFromAvatar,
            fromName : requestFromName,
            fromAdmin: fromAdmin,
            message : message,
            status : 0,
            response : '',
            reqType : reqType
        })
    )
    
    famRequest.insertMany(data)
    .then(req => { 
            const r = {error: false, message : 'REQUESTS_SENDED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));

});


const getAssist = (idUser, res) =>
{
    const idBroadcaster   = idUser;
    famRequest.find({ user: ObjectId(idBroadcaster) }).sort({'createdAt': -1}).limit(50)
    .then(requests => res.json(requests))
    .catch(err => res.status(400).json('Error: ', err));
}

router.route('/getAssist').post((req, res) => {
    const idBroadcaster   = req.body.idBroadcaster;
    getAssist(idBroadcaster, res);
});

router.route('/updateFamRequest').post((req, res) => {
    const idRequest   = req.body.idRequest;
    const idUser = req.body.idUser;
    const status = req.body.status;
    let data = {
        status : status
    };  
    famRequest.updateOne({_id: ObjectId(idRequest)}, data)
    .then(requests => getAssist(idUser, res) )
    .catch(err => res.status(400).json('Error: ', err));
});


    router.route('/getfamConversation').post((req, res) => {
        const idConversation    = req.body.idConversation;
        const idBroadcaster    = req.body.idBroadcaster;
        const skip    = req.body.skip || 0;
        const limit    = req.body.limit || 10;
        
        Promise.all([
            ChatMessage.aggregate([
                {
                    $match : {
                        idConversation: ObjectId(idConversation),
                        hideFrom : {$ne : ObjectId(idBroadcaster)}
                    },
                },
                {
                    $lookup:
                    {
                        from: "broadcasters",
                        localField: "sender",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind : "$userData"
                },
                {
                    $sort : {
                        createdAt : -1
                    }
                },
                { $project: { 
                    "_id" : "$_id",
                    "text" : "$message",
                    "image" : {$cond : [{$eq : ["$image", null]}, null, { $concat: [ exImagesUrl, "messages/images/", "$image" ] } ]},
                    "video" : {$cond : [{$eq : ["$video", null]}, null, { $concat: [ exImagesUrl, "messages/videos/", "$video" ] } ]},
                    "audio" : {$cond : [{$eq : ["$audio", null]}, null, { $concat: [ exImagesUrl, "messages/audios/", "$image" ] } ]},
                    "createdAt" : "$createdAt",
                    "user" : 
                        {"_id" :  "$userData._id",
                        "name" :  "$userData.nickname",
                        "avatar" :  { $concat: [ exImagesUrl, "avatars/", "$userData.picture" ] }
                        }
                    
                 } },
                { $skip : skip },
                { $limit : limit },
                {
                    $sort : {
                        createdAt : 1
                    }
                },
            ]),
            ChatMessage.updateMany(
                {idConversation : ObjectId(idConversation), "viewed.idBroadcaster" : {$ne : ObjectId(idBroadcaster) }}, 
                {
                    $push : {
                        viewed : {
                            idBroadcaster : ObjectId(idBroadcaster),
                        }
                    }
                }
            )
        ])
        .then( ([ conversation, viewdTransaction]) => {res.json(conversation)})
        .catch(err => res.status(400).send((err).toString()));
        
    });

    router.post('/addMessageFromConversation', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), function(req, res, next){


        const image   = (req.files && req.files['image'] != undefined) ? req.files['image'][0].filename : null;
        const video   = ( req.files && req.files['video'] != undefined) ? req.files['video'][0].filename : null;;
        const audio   = (req.files && req.files['audio'] != undefined) ? req.files['audio'][0].filename : null;

// router.route('/addMessageFromConversation').post((req, res) => {
    const sender    = req.body.sender;
    const idConversation  = req.body.idConversation;
    const message        = req.body.message || null;

    let messageItem = new ChatMessage({
        idConversation : ObjectId(idConversation),
        sender : ObjectId(sender),
        message,
        image,
        video,
        audio,
    });

    messageItem.save()
    .then(message => res.json(message))
    .catch(err => res.status(400).send((err).toString()));
    
  
});


router.route('/addFamMember').post((req, res) => {

    const idKingdom = req.body.idKingdom

    let data = {
        $push : {
          users : {user: req.body.idUser, level : 2}
        }
    };

    Kingdom.updateOne({_id : ObjectId(idKingdom)}, data)
    .then(req => { 
            const r = {error: false, message : 'REQUESTS_SENDED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/removeFamMember').post((req, res) => {

    const idKingdom = req.body.idKingdom;

    Kingdom.findOneAndUpdate(
        { _id: idKingdom },
        { $pull: { users: { user: req.body.idUser } } },
        { new: true }
      )
    .then(req => { 
            const r = {error: false, message : 'USER_REMOVED' };

            updateBroadcasterKingdom(req.body.idUser);
            getFamInfo(idKingdom, res);
        }
    )
    .catch(err => res.status(400).send((err).toString()));

});





router.route('/setFamMemberLevel').post((req, res) => {

    const idKingdom = req.body.idKingdom;
    const user = req.body.idUser;
    const level = req.body.level;

    Kingdom.updateOne({_id: ObjectId(idKingdom), "users.user" : ObjectId(user) },
    { $set: 
        { 
          "users.$.level":level,
        }
    })
    .then(req => { 
            const r = {error: false, message : 'USER_REMOVED' };
            getFamInfo(idKingdom, res);
            }
    )
    .catch(err => res.status(400).send((err).toString()));

});

router.route('/addKingdomTask').post((req, res) => {

    kTask = new kingdomTask( {
        icon : req.body.icon,
        title : req.body.title,
        value : req.body.value,
        loop : req.body.loop,
        type : req.body.type,
    });

    kTask.save()
    .then(tasks => { 
            
            res.json(tasks);
            }
    )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getTasks').post((req, res) => {

    kingdomTask.find({})
    .then(requests => {
        let tasks = requests;
        let tt = {};
        tasks.forEach( (elem, index) => {
            let t = tasks.find(el => el.type === elem.type);
            tt["task" + parseInt(index+1)] = t._id;
        })
        res.json({tasks: tt });
    })
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/getTasksTransactions').post((req, res) => {

    const idKingdom = req.body.idKingdom;
    const idBroadcaster = req.body.idBroadcaster;
    let thisDate = moment().utc().toString();
    let startDay = moment().utc().startOf('day').toString();
    let endDay = moment().utc().endOf('day').toString();
    console.log(new Date(startDay), endDay);

    let finalData = [];
    
    let isLoaded = false;

    kingdomTask.find({})
    .then(requests => 
        
        {

        var queries = [];
        

        if (requests) {
            requests.forEach((rq) => {
                if (rq.type < 4) {
                    queries.push(kingdomTaskTransaction.findOne({
                        idTask: ObjectId(rq._id),
                        idKingdom : ObjectId(idKingdom),
                        idBroadcaster : ObjectId(idBroadcaster), 
                        createdAt: {
                            $gte: new Date(startDay),
                            $lte: new Date(endDay)
                          }
                    }));
                    finalData.push(rq);
                }

                if (rq.type > 3 ) {
                    queries.push(kingdomTaskTransaction.aggregate([
                        {
                            $match : {
                                idTask: ObjectId(rq._id),
                                idKingdom : ObjectId(idKingdom),
                                idBroadcaster : ObjectId(idBroadcaster), 
                                createdAt: {
                                    $gte: new Date(startDay),
                                    $lte: new Date(endDay)
                                }
                            }
                        },
                        { $group : {_id:"$idBroadcaster", value:{$sum:"$value"}, count: { $sum: 1 } } }
                    ]));     
                    finalData.push(rq);
                }  

                       
            });
        }

        return Promise.all(queries);   
              
        }).then(listOfJobs => {
            let finalResponse = [];
            let totalContribution = 0;
            listOfJobs.forEach((job, index) => {
                if ( finalData[index].type < 4 ) {
                    let transaction = job ? { value : job.value, state : job.state, _idJob : job._id } : { value : 0, state : 0, _idJob : ""}
                    finalResponse.push({task : finalData[index], transaction});
                    if (job && job.state == 1) { totalContribution = totalContribution + job.value}
                }
                if ( finalData[index].type > 3 ) {
                    if (job.length > 0) {
                        let transaction = { value : job[0].value, state : 1, _idJob : "" };
                        finalResponse.push({task : finalData[index], transaction});
                        totalContribution = totalContribution + job[0].value;
                    }
                    if (job.length == 0) {
                        let transaction = { value : 0, state : 1, _idJob : "" };
                        finalResponse.push({task : finalData[index], transaction});
                    }
                    
                }
                
            });

            res.json({tasks: finalResponse, thisDate, midNight : endDay, totalContribution });

        }).catch(err => res.status(400).send((err).toString()));

});


router.route('/setSelectKingdom').post((req, res) => {

    const idKingdom = req.body.idKingdom;
    const idBroadcaster = req.body.idBroadcaster;
    
    Broadcaster.updateOne({_id: ObjectId(idBroadcaster)},
    { $set: 
        { 
          "settings.idKingdom" : idKingdom,
        }
    })
    .then(req => { 
            const r = {error: false, message : 'SELECTED_KINGDOM_UPDATED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/addKingdomTaskTransaction').post((req, res) => {

    const idKingdom = req.body.idKingdom;
    const idBroadcaster = req.body.idBroadcaster;
    const idTask = req.body.idTask;

    let startDay = moment().utc().startOf('day');
    let endDay = moment().utc().endOf('day')
    console.log(startDay, endDay);

    kTaskTransaction = new kingdomTaskTransaction( {
        idTask : req.body.idTask,
        idBroadcaster : req.body.idBroadcaster,
        idKingdom : req.body.idKingdom,
        value : req.body.value,
        state : req.body.state,
    });

    kingdomTaskTransaction.findOne({
        idTask: ObjectId(idTask),
        idKingdom : ObjectId(idKingdom),
        idBroadcaster : ObjectId(idBroadcaster), 
        createdAt: {
            $gte: startDay,
            $lte: endDay
          }
    }).then(tsk => { 
        if(!tsk) {
            kTaskTransaction.save()
            .then(req => { 
                    const r = {error: false, message : 'TRANSACTION_TASK_KINGDOM_ADDED' };
                    res.json(r);
                    }
            )
            .catch(err => res.status(400).send((err).toString()));
        }
        else {
            const r = {error: false, message : 'TRANSACTION_EXIST' };
            res.json(r);
        }
    }
    ).catch(err => {res.status(400).send((err).toString())});
    
});


router.route('/acclaimTask').post((req, res) => {
    let data = {
        state :  1,
    };
    kingdomTaskTransaction.updateOne({_id: ObjectId(req.body.idTransaction)}, data)
    .then(kingdom => { 
            const r = {error : false, message : 'KINGDOM_TRANSACTION_EDITED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));
});


const getFamInfo = (idK, res) => {
   
    Promise.all([
    Kingdom.aggregate( [
        {
            $match : {
              _id: ObjectId(idK)
            }
          },
          { $unwind : "$users" },
        {
            $lookup: {
               from: "broadcasters",
               localField: "users.user",    
               foreignField: "_id", 
               as: "usersData"
            }
         },

         {$unwind: {
            path: '$usersData',
          }}, 
          

        { $project: { 
            "_id" :  "$usersData._id",
            "nickname" :  "$usersData.nickname",
            "avatar" :  "$usersData.picture",
            "level" : "$users.level"
         } }
        
     ] ),

     Kingdom.aggregate( [
        {
            $match : {
              _id: ObjectId(idK)
            }
          },

          {
            $lookup: {
               from: "broadcasters",
               localField: "owner",    
               foreignField: "_id", 
               as: "ownerData"
            }
         },
         { $unwind: "$ownerData" },
        { $project: { 
            "kingdomName" : "$kingdomName",
            "kingdomDescription" : "$kingdomDescription",
            "kingdomPicture" : "$kingdomPicture",
            "ownerId" : "$ownerData._id",
            "ownerNickname" : "$ownerData.nickname",
            "ownerAvatar" : "$ownerData.picture",
            "kingdomType" : "$kingdomType",
            }  
         } 
        
     ] ),


    ])
     .then(([us, king]) => res.json({users : us, fam: king[0] }))
    .catch(err => {
        res.status(400).send((err).toString())});
}




module.exports = router;
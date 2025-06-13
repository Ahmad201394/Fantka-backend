const router = require('express').Router();

let Followers = require('../models/followers.model');
let BroadcasterSettings = require('../models/broadcastersettings.model');
var ObjectId = require('mongoose').Types.ObjectId; 

router.route('/').post((req, res) => {

    BroadcasterSettings.find()
    .then(battles => res.json(battles) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getSettings').post((req, res) => {
    const broadcasterId = req.body.broadcasterId;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;

    const followersQuery = [
        {
            $match : {
                idFollower: ObjectId(broadcasterId)
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
        {$unwind : "$followerData"},
        {
            $lookup:
            {
                from: "broadcastersettings",
                localField: "idFollower",
                foreignField: "broadcasterId",
                as: "notificationData"
            }
        },
        {$unwind : {path : "$notificationData", preserveNullAndEmptyArrays : true}},
        {
            $project : {
                follwerId : "$followerData._id",
                follwerNickname : "$followerData.nickname",
                follwerPicture : "$followerData.picture",
                idFollower : "$idFollower",
                disabled : {
                    // $in : ["$followerData._id", "$notificationData.notification.followers" ]
                    $cond:[
                        {
                            $gt:[
                                {
                                    $size: 
                                    {"$ifNull": [ {$setIntersection:[["$followerData._id"], "$notificationData.notification.followers" ] }, [] ]}
                                    
                                }
                                ,0
                            ]
                        },
                        true,
                        false
                    ]
                }
            }
        },
        { $limit : limit },
        { $skip : skip },
    ]
    Promise.all([
        BroadcasterSettings.findOne({broadcasterId : ObjectId(broadcasterId)} ,{ "notification.followers" : 0}),
        Followers.aggregate(followersQuery)
    ]).then( ([ broadcasterSettings, followersNotification ]) => {
        res.json( {broadcasterSettings, followersNotification})
    }).catch(err => res.status(400).send((err).toString()));
    
});


router.route('/updateGeneralSettings').post((req, res) => {
    const broadcasterId = req.body.broadcasterId;
    const friendsInvitation = req.body.friendsInvitation;
    const newFans = req.body.newFans;

    BroadcasterSettings.updateOne(
        {broadcasterId : ObjectId(broadcasterId)}, 
        {  
            $set : {
                "general.friendsInvitation" : friendsInvitation,
                "general.newFans" : newFans
            },
        },
        {upsert : true}
    )
    .then(settings => res.json(settings) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/updateNotifications').post((req, res) => {
    const broadcasterId = req.body.broadcasterId;
    const privateMessages = req.body.privateMessages;
    const anonymousMessages = req.body.anonymousMessages;
    const systemMessages = req.body.systemMessages;

    BroadcasterSettings.updateOne(
        {broadcasterId : ObjectId(broadcasterId)}, 
        {
            $set : {
                "notification.privateMessages" : privateMessages,
                "notification.anonymousMessages" : anonymousMessages,
                "notification.systemMessages" : systemMessages
            },
        },
        {upsert : true}
    )
    .then(settings => res.json(settings) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/updatePrivacy').post((req, res) => {
    const broadcasterId = req.body.broadcasterId;
    const lastActifTime = req.body.lastActifTime;
    const onlineStatus = req.body.onlineStatus;
    const callsOff = req.body.callsOff;

    BroadcasterSettings.updateOne(
        {broadcasterId : ObjectId(broadcasterId)}, 
        {
            $set : {
                "notification.lastActifTime" : lastActifTime,
                "notification.onlineStatus" : onlineStatus,
                "notification.callsOff" : callsOff
            },
        },
        {upsert : true}
    )
    .then(settings => res.json(settings) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/disableNotificationFromFollower').post((req, res) => {
    const broadcasterId = req.body.broadcasterId;
    const idFollower = req.body.idFollower;

    BroadcasterSettings.updateOne(
        {broadcasterId : ObjectId(broadcasterId)}, 
        {
            $push : {
                "notification.followers" :  ObjectId(idFollower)
            },
        },
        {upsert : true}
    )
    .then(settings => res.json(settings) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/enableNotificationFromFollower').post((req, res) => {
    const broadcasterId = req.body.broadcasterId;
    const idFollower = req.body.idFollower;
    console.log(idFollower)
    BroadcasterSettings.updateOne(
        {broadcasterId : ObjectId(broadcasterId)}, 
        {
            $pull : {
                "notification.followers" : {
                    followerId : ObjectId(idFollower)
                }
            },
        },
        {upsert : true}
    )
    .then(settings => res.json(settings) )
    .catch(err => res.status(400).send((err).toString()));
});

module.exports = router;

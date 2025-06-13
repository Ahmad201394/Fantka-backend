const router = require('express').Router();
let Followers = require('../models/followers.model');
let Broadcaster = require('../models/brodcaster.model');
let LiveStream = require('../models/livestream.model');

var ObjectId = require('mongoose').Types.ObjectId; 

router.route('/').post((req, res) => {
    Followers.find()
      .then(streams => res.json(streams))
        .catch(err => res.status(400).send((err).toString()));
  });
router.route('/b').post((req, res) => {
    Broadcaster.find()
      .then(streams => res.json(streams))
        .catch(err => res.status(400).send((err).toString()));
  });
  
router.route('/isFollowing').post((req, res) => {
    var idFollowed = req.body.idFollowed;
    var idFollower = req.body.idFollower;

    Followers.findOne({idFollowed: ObjectId(idFollowed), idFollower : ObjectId(idFollower) })
    .then(follower => {
        if (follower) res.json({isFollowing : true});
        else res.json({isFollowing : false});
    })
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getFans').post((req, res) => {
    var idFollowed = req.body.idFollowed;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;
    const searchInput = req.body.searchInput || null; 
    var globalQuery = [
        {
            $match : {
                idFollowed: ObjectId(idFollowed)
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idFollower",
                foreignField: "_id",
                as: "followerData"
            }
        },
        {
            $unwind : {path : "$followerData", preserveNullAndEmptyArrays : true}
        },
        { 
            $lookup: {
                "from": "followers",
                "localField": "idFollower",
                "foreignField": "idFollowed",
                "as": "otherFollowers"
            }
        },
        {
            $addFields:{
               "isFollower" : {
                    $cond:[
                        {
                            $gt:[
                                {
                                    $size: 
                                    {"$ifNull": [ {$setIntersection:["$otherFollowers.idFollower", [ObjectId(idFollowed)]]}, [] ]}
                                    
                                }
                                ,0
                            ]
                        },
                        true,
                        false
                    ]
                },
            }
        },
        {
            $project : {
                followerData : {
                "_id": 0,
                idDealer: 0,
                idBroadcaster: 0,
                biography: 0,
                phone: 0,
                localphone: 0,
                email: 0,
                sex: 0,
                birthday: 0,
                // stats: 0,
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
                settings: 0
              },
              otherFollowers : 0
            }
        },
        { $sort : { createdAt : -1 } },
        {$skip : skip},
        {$limit : limit}
        
    ];

    if(searchInput) {
        globalQuery.splice(5, 0, {
            $match : {
                $or: [ 
                    { "followerData.idBroadcaster": {$regex: ".*" + searchInput + ".*" }}, 
                    { "followerData.nickname":  {$regex: ".*" + searchInput + ".*" , $options: 'i'}} 
                ]
            }
        });
    }
    Followers.aggregate(globalQuery)
    .then(fans => {
        res.json(fans);
    })
    .catch(err => res.status(400).send((err).toString()))
});

router.route('/getFollowers').post((req, res) => {
    var idFollower = req.body.idFollower;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;
    const searchInput = req.body.searchInput || null; 
    var globalQuery = [
        {
            $match : {
                idFollower: ObjectId(idFollower)
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
            $project : {
                followerData : {
                    "_id": 0,
                    idDealer: 0,
                    idBroadcaster: 0,
                    biography: 0,
                    phone: 0,
                    localphone: 0,
                    email: 0,
                    sex: 0,
                    birthday: 0,
                    // stats: 0,
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
                    settings: 0
                }
            }
        },
        { $sort : { createdAt : -1 } },
        {$skip : skip},
        {$limit : limit},
    ];
    if(searchInput) {
        globalQuery.splice(5, 0, {
            $match : {
                $or: [ 
                    { "followerData.idBroadcaster": {$regex: ".*" + searchInput + ".*" }}, 
                    { "followerData.nickname":  {$regex: ".*" + searchInput + ".*" , $options: 'i'}} 
                ]
            }
        });
    }
    Followers.aggregate(globalQuery)
    .then(followers => {
        res.json(followers);
    })
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/addFollowing').post((req, res) => {
    var idFollower = req.body.idFollower;
    var idFollowed = req.body.idFollowed;
    var idLiveStream = req.body.idLiveStream || null;

    var follower = new Followers({
        idFollower,
        idFollowed,
        idLiveStream
    });
    
    follower.save()
    .then(following => {
        Promise.all([
            Broadcaster.updateOne({ _id: idFollowed }, {$inc: {"stats.fans" : 1} }),
            Broadcaster.updateOne({ _id: idFollower }, {$inc: {"stats.following" : 1} }),
            (idLiveStream != null) ? LiveStream.updateOne({ _id: idLiveStream }, {$inc: {"stats.fans" : 1} }) : null
        ]).then( ([ followed, follower, stream ]) => {
            res.json({followed, follower, stream })
        }).catch(err => res.status(400).send((err).toString()));
    }).catch(err => res.status(400).send((err).toString()));
});

router.route('/removeFollower').post((req, res) => {
    var idFollower = req.body.idFollower;
    var idFollowed = req.body.idFollowed;
    Followers.remove({idFollowed: ObjectId(idFollowed),idFollower : ObjectId(idFollower) })
    .then(unFollowing => {
        Promise.all([
            Broadcaster.updateOne({ _id: idFollowed }, {$inc: {"stats.fans" : -1} }),
            Broadcaster.updateOne({ _id: idFollower }, {$inc: {"stats.following" : -1} })
        ]).then( ([ followed, follower ]) => {
            res.json(unFollowing)
        }).catch(err => res.status(400).send((err).toString()));
    })
    .catch(err => res.status(400).send((err).toString()));
});

module.exports = router;

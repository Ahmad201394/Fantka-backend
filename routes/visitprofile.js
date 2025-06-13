const router = require('express').Router();
let VisitStream = require('../models/visitstream.model');

let VisitProfile = require('../models/visitprofile.model');
var ObjectId = require('mongoose').Types.ObjectId; 

router.route('/addViewProfile').post((req, res) => {
    const idProfile = req.body.idProfile;
    const idViewer = req.body.idViewer;
    const date = Date.parse(new Date());

    VisitProfile.updateOne({idProfile: ObjectId(idProfile), idViewer: ObjectId(idViewer)},{
        $setOnInsert : {
            idProfile : idProfile,
            idViewer : idViewer,
        },
        $inc : { visitCount : 1 },
        $set : { date : date}
    }, {upsert:true})
    .then(viewProfile => res.json(viewProfile))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getProfileViews').post((req, res) => {
    const idProfile = req.body.idProfile;

    VisitProfile.aggregate([
        {
            $match : {
                idProfile : ObjectId(idProfile)
            },
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idViewer",
                foreignField: "_id",
                as: "viewerData"
            }
        },
        {
            $unwind : {path : "$viewerData", preserveNullAndEmptyArrays : true}
        },
        { 
            $lookup: {
                "from": "followers",
                "localField": "idViewer",
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
                                    {"$ifNull": [ {$setIntersection:["$otherFollowers.idFollower", [ObjectId(idProfile)]]}, [] ]}
                                    
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
                viewerData : {
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
        { $sort : { date : -1 } }     

    ])
    .then(viewProfile => res.json(viewProfile))
    .catch(err => res.status(400).send((err).toString()));
});
 
router.route('/addViewStream').post((req, res) => {
    const idProfile = req.body.idProfile;
    const idViewer = req.body.idViewer;
    const date = Date.parse(new Date());

    VisitStream.updateOne({idProfile: ObjectId(idProfile), idViewer: ObjectId(idViewer)},{
        $setOnInsert : {
            idProfile : idProfile,
            idViewer : idViewer,
        },
        $inc : { visitCount : 1 },
        $set : { date : date}
    }, {upsert:true})
    .then(viewProfile => res.json(viewProfile))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getStreamView').post((req, res) => {
    const idViewer = req.body.idViewer;

    VisitStream.aggregate([
        {
            $match : {
                idViewer : ObjectId(idViewer)
            },
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idProfile",
                foreignField: "_id",
                as: "viewerData"
            }
        },
        {
            $unwind : {path : "$viewerData", preserveNullAndEmptyArrays : true}
        },
        { 
            $lookup: {
                "from": "followers",
                "localField": "idProfile",
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
                                    {"$ifNull": [ {$setIntersection:["$otherFollowers.idFollower", [ObjectId(idViewer)]]}, [] ]}
                                    
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
                viewerData : {
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
        { $sort : { date : -1 } }     
    ])
    .then(viewProfile => res.json(viewProfile))
    .catch(err => res.status(400).send((err).toString()));
});
 
module.exports = router;


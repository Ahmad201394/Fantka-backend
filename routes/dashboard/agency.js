const router = require('express').Router();
var path = require('path')
const bcrypt = require('bcrypt');
let AgencyMembers = require('../../models/agencymembers.model');
var ObjectId = require('mongoose').Types.ObjectId; 

let Agency = require('../../models/agency.model');

router.route('/getAgencyMembers').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const idBroadcaster = req.body.idBroadcaster;
    const followerId = [ObjectId(idBroadcaster)];
    const getAgencyQuery = [
        {
            $match : {
                _id : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "ownerId",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $project : {
                idBroadcaster : "$broadcasterData._id",
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
            }
        },
    ];
    const getMembersQuery = [
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idBroadcaster",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $sort: {
              "broadcasterData.stats.diamonds": -1
            }
          },
        {
            $project : {
                _id : 1,
                idBroadcaster : 1,
                status : 1,

                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                level : "$broadcasterData.stats.level",
                diamonds : "$broadcasterData.stats.diamonds",
                idb: "$broadcasterData.idBroadcaster"
            }
        },
        {
            $lookup:
            {
                from: "followers",
                localField: "idBroadcaster",
                foreignField: "idFollowed",
                as: "follower"
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
                                    {"$ifNull": [ {$setIntersection:["$follower.idFollower", followerId]}, [] ]}
                                    
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
                follower : 0
            }
        }
    ]
    
    Promise.all([
        AgencyMembers.aggregate(getMembersQuery),
        Agency.aggregate(getAgencyQuery),
    ]).then( ([ agencyMembers, agencyData]) => {
        let i = 1;
        let totalDiamonds = 0
        agencyMembers.forEach(broadcaster => {
            totalDiamonds += broadcaster.diamonds;
            broadcaster.rank = i;
            i++
        });
        res.json( {agencyMembers, agencyData, totalDiamonds})

    }).catch(err => res.status(400).send((err).toString()));
});


module.exports = router;
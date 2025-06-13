const router = require('express').Router();
var path = require('path')
const bcrypt = require('bcrypt');
let Agency = require('../models/agency.model');
let AgencyMembers = require('../models/agencymembers.model');
let AgencyRequest = require('../models/agencyrequest.model');

let Broadcaster = require('../models/brodcaster.model');
var ObjectId = require('mongoose').Types.ObjectId; 
let multer = require("multer");
var randtoken = require('rand-token').generator();
const JWT =  require('jsonwebtoken');
const saltRounds = 10;

const Storage = multer.diskStorage({
    destination(req, file, callback){
        callback(null, 'public/uploads/agencyfiles/');
    },
    filename(req, file, callback){
        callback(null,"ag-" + Date.now() + randtoken.generate(5, "0AZERTYUIOPMLKJHGFDSQWXCVBNnbvcxwqsdfghjklmpoiuytreza123456789")  + path.extname(file.originalname));
    }
});

var upload = multer({storage: Storage, limits: {fileSize: 1000000}});

router.post('/addAgency', upload.fields([{ name: 'pictureFront', maxCount: 1 }, { name: 'pictureBack', maxCount: 1 }, { name: 'pictureWithId', maxCount: 1 }]), function(req, res, next){
    
    const idAgency = randtoken.generate(9, "0123456789");  
    const phone = req.body.phone;
    const email = req.body.email;
    const login = req.body.login;
    const status = req.body.status;
    const ownerId = req.body.ownerId;
    const name = req.body.name;
    const type = req.body.type;
    const accountName = req.body.accountName;
    const bankNum = req.body.bankNum;
    const bankName = req.body.bankName;
    const bankAdress = req.body.bankAdress;
    const bankSwift = req.body.bankSwift;
    const billingAdress = req.body.billingAdress;
    const pictureFront    = req.files['pictureFront'][0].filename;
    const pictureBack    = req.files['pictureBack'][0].filename;
    const pictureWithId   = req.files['pictureWithId'][0].filename;

    bcrypt.hash(req.body.password.trim(), saltRounds, function(err, hash) {

        let newAgency = new Agency({
            idAgency ,
            phone ,
            email ,
            login,
            password : hash,
            status ,
            ownerId ,
            name ,
            pictureFront ,
            pictureBack ,
            pictureWithId ,
            accountInfo : {
                type : type,
                name : accountName,
                bankNum : bankNum,
                bankName : bankName,
                bankAdress : bankAdress,
                bankSwift : bankSwift,
                billingAdress : billingAdress,
            }
        })
        Agency.find({login})
        .then(agency => {
            if(agency.length === 0 ){
                newAgency.save()
                .then( newAgencySaved => res.json(newAgencySaved) )
                .catch(err => res.status(400).send((err).toString()));
            }else{
                res.json("Agency login Found.")
            }
        })
        .catch(err => {res.status(400).send((err).toString())});
    });
});


router.route('/login').post((req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    let profilePicture = '';

    Agency.findOne({login: login})
    .then(agency => {
        if (agency) {
            bcrypt.compare(password, agency.password, (error, response) => {
              if (response) {
                const id = agency._id;
                const token = JWT.sign({id}, process.env.JWTSECRET, {});

                Broadcaster.findOne({_id: ObjectId(agency.ownerId)}, {picture: 1})
                .then(brod => { 
                    profilePicture = brod.picture;
                    const r = {isLogin : true, idagency : agency._id, nickname : agency.name, codeAgnecy : agency.idAgency, picture : profilePicture, ownerId: agency.ownerId, token: token };
                    res.json(r);
                })
                .catch(err => res.status(400).send((err).toString()));
                
              }
              else {
                res.json({isLogin : false, message: "Wrong username/password combination!"})
              }
            });
        }
        else {
            res.json({isLogin : false, message: "Wrong username/password combination!"})
        }
    })
    .catch(err => res.status(400).send((err).toString()));
    
});

router.route('/sendRequest').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;    
    const idAgency    = req.body.idAgency;    
    const status = req.body.status;
    
    var request = new AgencyRequest({
        idBroadcaster,
        idAgency,
        status,
    });
    
    request.save()
    .then( request => res.json(request) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getAgencyRequests').post((req, res) => {
    const idAgency    = req.body.idAgency;

    AgencyRequest.aggregate([
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
            $project : {
                _id : 1,
                idBroadcaster : 1,
                idAgency : 1,
                status : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                idb : "$broadcasterData.idBroadcaster",
                level : "$broadcasterData.stats.level",
            }
        }
    ])
    .then( requests => res.json(requests))
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/searchBroadcaster').post((req, res) => {
    var searchInput = req.body.searchInput;
    Broadcaster.aggregate([
        {
            $match : {
                 idBroadcaster: searchInput 
            }, 
        },
        {
            $lookup:
            {
                from: "agencymembers",
                localField: "_id",
                foreignField: "idBroadcaster",
                as: "isMember"
            }
        },
        {
            $lookup:
            {
                from: "agencyrequests",
                localField: "_id",
                foreignField: "idBroadcaster",
                as: "isRequested"
            }
        },
        { $addFields: { agency: { "$arrayElemAt": [ "$isMember", 0 ] } } },
        {
            $project : {
            _id : 1,
            idBroadcaster : 1,
            nickname : 1,
            picture : 1,
            level : "$stats.level",
            idAgency : "$agency.idAgency", 
            isMemberOfAgency : {$cond: [ { $gt: [ {$size : "$isMember"}, 0 ] }, true, false ]},
            isMemberRequested : {$cond: [ { $gt: [ {$size : "$isRequested"}, 0 ] }, true, false ]}
            }
        }
    ])
    .then(broadcasters => { 
        if(broadcasters.length > 0){
            res.json(broadcasters[0]);
        }else{
            res.json(null);
        }
    })
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getAgencyStats').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const idBroadcaster    = req.body.idBroadcaster;

    Promise.all([

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency),
                idBroadcaster : ObjectId(idBroadcaster)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart:  { $subtract: [ '$startAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] }
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: 
                    {
                        day: {$dayOfMonth: "$startAt"},
                        month: {$month: "$startAt"}, 
                        year: {$year: "$startAt"}
                    }, 
                    dailyPeriod : {$sum : "$period"},
                    dailyDiamonds : {$sum : "$streamDiamonds"},
                },
        },
        {
            $group:
                {
                    _id: null, 
                    totalHours : {$sum : "$dailyPeriod"},
                    totalDiamond : {$sum : "$dailyDiamonds"},
                    totalDays : {$sum : 1},
                },
        },
    ]),
    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency),
                idBroadcaster : ObjectId(idBroadcaster)
            }
        },
        {
            $lookup:
            {
                from: "gifts",
                localField: "idBroadcaster",
                foreignField: "idReciever",
                as: "coinsVal"
            }
        },
        {$unwind : "$coinsVal"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                createdAt : 1,
                giftDiamonds : "$coinsVal.value",
                giftSendAt : "$coinsVal.createdAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$giftSendAt"},
                afterStart:  { $subtract: [ '$giftSendAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: null,
                    memberDiamonds : {$sum : "$giftDiamonds"},
                },
        },
    ])
])
    .then( ([members, coins]) => {
        members.forEach( (elem, index) => {
            let t = coins.filter(el => el._id == elem._id);
            if (t.length > 0) {
                elem.totalDiamond = t[0].memberDiamonds;
            }
            if (t.length == 0) {
                elem.totalDiamond = 0;
            }

        })
        res.json(members)
        console.log(members, coins)
    } )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getBroadcasterRequests').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;

    AgencyRequest.aggregate([
        {
            $match : {
                idBroadcaster : ObjectId(idBroadcaster)
            }
        },
        {
            $lookup:
            {
                from: "agencies",
                localField: "idAgency",
                foreignField: "_id",
                as: "agencyData"
            }
        },
        {$unwind : "$agencyData"},
        {
            $project : {
                _id : 1,
                codeAgency : "$agencyData.idAgency",
                idAgency : "$agencyData._id",
                name : "$agencyData.name",
                requestDate : "$createdAt",
            }
        }
    ])
    .then( requests => res.json(requests))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/removeAgencyMember').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const idBroadcaster    = req.body.idBroadcaster;
    Promise.all([
        AgencyMembers.remove({idAgency : ObjectId(idAgency), idBroadcaster : ObjectId(idBroadcaster)}),
        Broadcaster.findOneAndUpdate({ _id : ObjectId(idBroadcaster)}, {$set : {idDealer : null}}, {new :true}),
    ]).then(([removed, updated]) => res.json({removed, updateBroadcaster : updated.idDealer}))
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/validateRequest').post((req, res) => {
    const idRequest    = req.body.idRequest;
    const isAccepted = req.body.isAccepted;
    
    AgencyRequest.findOneAndRemove({_id : ObjectId(idRequest)})
    .then( request => {
        if(isAccepted && request != null){
            var addMember = new AgencyMembers({
                idAgency : request.idAgency,
                idBroadcaster : request.idBroadcaster,
                status : 1,
                startDate : Date.parse(new Date())
            })
            Promise.all([
                Broadcaster.findOneAndUpdate({ _id : ObjectId(request.idBroadcaster)}, {$set : {idDealer : request.idAgency}}, {new :true}),
                AgencyRequest.deleteMany({ idBroadcaster : ObjectId(request.idBroadcaster)}),
                addMember.save()
            ]).then( ([ updateBroadcaster, requestDeleted, pushMember ]) => {
                console.log(updateBroadcaster.length)
                updateBroad = updateBroadcaster ? true : false;
                res.json( {updateBroad, requestDeleted, pushMember})
            }).catch(err => res.status(400).send((err).toString()));
        }else{
            res.json(request)
        }
    })
    .catch(err => res.status(400).send((err).toString()));
});



router.route('/getAgencyAllStats_old').post((req, res) => {
    const idAgency    = req.body.idAgency;



    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] }
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: 
                    {
                        idBroadcaster : "$idBroadcaster",
                        day: {$dayOfMonth: "$startAt"},
                        month: {$month: "$startAt"}, 
                        year: {$year: "$startAt"}
                    }, 
                    dailyPeriod : {$sum : "$period"},
                    dailyDiamonds : {$sum : "$streamDiamonds"},
                },
        },
        {
            $group:
                {
                    _id: "$_id.idBroadcaster", 
                    totalHours : {$sum : "$dailyPeriod"},
                    totalDiamond : {$sum : "$dailyDiamonds"},
                    totalDays : {$sum : 1},
                },
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "_id",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $project : {
                _id : 1,
                totalHours : 1,
                totalDiamond : 1,
                totalDays : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                idb : "$broadcasterData.idBroadcaster",
                level : "$broadcasterData.stats.level",
            }
        }

    ])
    .then( members => res.json(members) )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getAgencyAllStats').post((req, res) => {
    const idAgency    = req.body.idAgency;

    Promise.all([

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",

            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] },
                
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: 
                    {
                        idBroadcaster : "$idBroadcaster",
                        day: {$dayOfMonth: "$startAt"},
                        month: {$month: "$startAt"}, 
                        year: {$year: "$startAt"}
                    }, 
                    dailyPeriod : {$sum : "$period"},
                    dailyDiamonds : {$sum : "$streamDiamonds"},
                    memberStartDate1: { $push: "$startDate" }
                },
        },
        {
            $group:
                {
                    _id: "$_id.idBroadcaster", 
                    totalHours : {$sum : "$dailyPeriod"},
                    totalDiamond : {$sum : "$dailyDiamonds"},
                    totalDays : {$sum : 1},
                    memberStartDate: { $push: { $slice: ["$memberStartDate1", 1] } }
                },
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "_id",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $project : {
                _id : 1,
                totalHours : 1,
                totalDiamond : 1,
                totalDays : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                idb : "$broadcasterData.idBroadcaster",
                level : "$broadcasterData.stats.level",
                memberStartDate : {$slice: ["$memberStartDate", 1]},
            }
        }

    ]),

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "gifts",
                localField: "idBroadcaster",
                foreignField: "idReciever",
                as: "coinsVal"
            }
        },
        {$unwind : "$coinsVal"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                createdAt : 1,
                giftDiamonds : "$coinsVal.value",
                giftSendAt : "$coinsVal.createdAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$giftSendAt"},
                afterStart:  { $subtract: [ '$giftSendAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: "$idBroadcaster",
                    memberDiamonds : {$sum : "$giftDiamonds"},
                },
        },
    ])
    ])
    .then( ([members, coins]) => {
        members.forEach( (elem, index) => {
            let t = coins.filter(el => el._id == elem._id.toString());
            if (t.length > 0) {
                elem.totalDiamond = t[0].memberDiamonds;
            }
            if (t.length == 0) {
                elem.totalDiamond = 0;
            }

        })
        res.json(members)
    } )
    .catch(err => res.status(400).send((err).toString()));

});



router.route('/getAgencyTotalStats').post((req, res) => {
    const idAgency    = req.body.idAgency;


    Promise.all([

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] }
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
            {
                _id: 
                {
                    idBroadcaster : "$idBroadcaster",
                    day: {$dayOfMonth: "$startAt"},
                    month: {$month: "$startAt"}, 
                    year: {$year: "$startAt"}
                }, 
                dailyPeriod : {$sum : "$period"},
                dailyDiamonds : {$sum : "$streamDiamonds"},
            },
        },
        {
            $group:
            {
                _id: "$_id.idBroadcaster", 
                totalHoursByBroadcaster : {$sum : "$dailyPeriod"},
                totalDiamondByBroadcaster : {$sum : "$dailyDiamonds"},
            },
        },
        {
            $group:
            {
                _id: null, 
                totalHours : {$sum : "$totalHoursByBroadcaster"},
                totalDiamond : {$sum : "$totalDiamondByBroadcaster"},
                countMembers : {$sum : 1}
            },
        }

    ]),

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "gifts",
                localField: "idBroadcaster",
                foreignField: "idReciever",
                as: "coinsVal"
            }
        },
        {$unwind : "$coinsVal"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                createdAt : 1,
                giftDiamonds : "$coinsVal.value",
                giftSendAt : "$coinsVal.createdAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$giftSendAt"},
                afterStart:  { $subtract: [ '$giftSendAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: "$idBroadcaster",
                    memberDiamonds : {$sum : "$giftDiamonds"},
                },
        },
        {
            $group:
            {
                _id: null, 
                totalDiamond : {$sum : "$memberDiamonds"},
            },
        }

    ])
])
    .then( ([data, totalDiamonds]) => {
        if(data.length > 0){
            res.json({_id :null, totalHours:data[0].totalHours, totalDiamond : totalDiamonds[0].totalDiamond, countMembers: data[0].countMembers});
        }else{
            res.json({_id :null, totalHours:0, totalDiamond : 0, countMembers: 0});
        }
    })
    .catch(err => res.status(400).send((err).toString()));
});


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
                profileId : "$broadcasterData.idBroadcaster",
                picture : "$broadcasterData.picture",
                level : "$broadcasterData.stats.level",
                diamonds : "$broadcasterData.stats.diamonds"
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
        agencyMembers.forEach(broadcaster => {
            broadcaster.rank = i;
            i++
        });
        res.json( {agencyMembers, agencyData })

    }).catch(err => res.status(400).send((err).toString()));
});


router.route('/getAgencies').post((req, res) => {

    Agency.aggregate([
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
            $project: {
                agencyName : "$name",
                picture : "$broadcasterData.picture",
                agencyId : "$idAgency",
                ownerName : "$broadcasterData.nickname",
                ownerId : "$broadcasterData._id"
            }
        }
    ])
    .then( request => res.json(request) )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getAgencyMembersForBroadcaster').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const idBroadcaster = req.body.idBroadcaster;
    const followerId = [ObjectId(idBroadcaster)];
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
            $project : {
                _id : 1,
                idBroadcaster : 1,
                status : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                level : "$broadcasterData.stats.level",
                startDate : 1
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
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
                status : 1,
                nickname : 1,
                picture : 1,
                level : 1,
                isFollower : 1
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart: { $subtract: [ '$endAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                // afterStart : {$gt : 0},
            }
        },
        {
            $group:
            {
                _id : {
                    idBroadcaster : "$idBroadcaster",
                    nickname : "$nickname",
                    picture : "$picture",
                    level : "$level",
                    isFollower : "$isFollower"
                },
                diamondsOfEachStream : {
                    $push: {
                        $cond: { 
                            if: { $gt: [ "$afterStart", 0 ] }, 
                            then: "$streamDiamonds",
                            else: 0,
                        }
                    }
                }
            },
        },
        {
            $unwind : "$diamondsOfEachStream"
        },
        {
            $group:
            {
                _id : {
                    idBroadcaster : "$_id.idBroadcaster",
                    nickname : "$_id.nickname",
                    picture : "$_id.picture",
                    level : "$_id.level",
                    isFollower : "$_id.isFollower",
                },
                diamonds : {$sum : "$diamondsOfEachStream"},
            },
        },
        {
            $project : {
                _id : "$_id.idBroadcaster",
                nickname : "$_id.nickname",
                picture : "$_id.picture",
                level : "$_id.level",
                isFollower : "$_id.isFollower",
                diamonds : 1
            }
        },
        {
            $sort : {
                diamonds : -1
            }
        },
    ];
    
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
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
            }
        },
    ];
    
    const getBroadcasterQuery = [
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
            {
                _id : "$idBroadcaster",
                diamonds : {$sum : "$streamDiamonds"},
            },
        },
        {
            $sort : {
                diamonds : -1
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "_id",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $project : {
                diamonds : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                level : "$broadcasterData.stats.level"
            }
        },
    ]
        
    Promise.all([
        AgencyMembers.aggregate(getMembersQuery),
        Agency.aggregate(getAgencyQuery),
        AgencyMembers.aggregate(getBroadcasterQuery)
    ]).then( ([ agencyMembers, agencyData, broadcasterData]) => {
        let i = 1;
        agencyMembers.forEach(broadcaster => {
            broadcaster.rank = i;
            i++
        });
        res.json( {agencyMembers, agencyData, broadcasterData  })

    }).catch(err => res.status(400).send((err).toString()));

});

const newAgency = {
    "idAgency" : "935357320",
    "phone" : "4654",
    "email" : "manhal@fantka.com",
    "login" : "star",
    "password" : "$2b$10$LkHEphsdZ512iQbD7FFrv.k89FU7YMRXHxcyfEbKcP4jtJEKOEUhq",
    "status" : "1",
    "ownerId" : "6294d48453c5694a828bad68",
    "name" : "Star",
    "pictureFront" : "sdfsdf",
    "pictureBack" : "fsdfsd",
    "pictureWithId" : "dsffsdf",
    "accountInfo" : {
        "type" : "hjk",
        "name" : "dsdsq",
        "bankNum" : "46464",
        "bankName" : "sqdqs",
        "bankAdress" : "dqsdqjksdgk",
        "bankSwift" : "dqsds",
        "billingAdress" : "qsdqsd"
    }
};


router.route('/addNewAgency').post((req, res) => {

    let ag = new Agency(newAgency);
    ag.save().then( newAgencySaved => res.json(newAgencySaved) )
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/getAgencyAllStatsByDate').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const mm    = req.body.month;

    Promise.all([

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] }
            }
        },
        {
            $match: {
                month : mm,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: 
                    {
                        idBroadcaster : "$idBroadcaster",
                        day: {$dayOfMonth: "$startAt"},
                        month: {$month: "$startAt"}, 
                        year: {$year: "$startAt"}
                    }, 
                    dailyPeriod : {$sum : "$period"},
                    dailyDiamonds : {$sum : "$streamDiamonds"},
                },
        },
        {
            $group:
                {
                    _id: "$_id.idBroadcaster", 
                    totalHours : {$sum : "$dailyPeriod"},
                    totalDiamond : {$sum : "$dailyDiamonds"},
                    totalDays : {$sum : 1},
                },
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "_id",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $project : {
                _id : 1,
                totalHours : 1,
                totalDiamond : 1,
                totalDays : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                idb : "$broadcasterData.idBroadcaster",
                level : "$broadcasterData.stats.level",
            }
        }

    ]),

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "gifts",
                localField: "idBroadcaster",
                foreignField: "idReciever",
                as: "coinsVal"
            }
        },
        {$unwind : "$coinsVal"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                createdAt : 1,
                giftDiamonds : "$coinsVal.value",
                giftSendAt : "$coinsVal.createdAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$giftSendAt"},
                afterStart:  { $subtract: [ '$giftSendAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date().getMonth() + 1,
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: "$idBroadcaster",
                    memberDiamonds : {$sum : "$giftDiamonds"},
                },
        },
    ])
    ])
    .then( ([members, coins]) => {
        members.forEach( (elem, index) => {
            let t = coins.filter(el => el._id == elem._id.toString());
            if (t.length > 0) {
                elem.totalDiamond = t[0].memberDiamonds;
            }
            if (t.length == 0) {
                elem.totalDiamond = 0;
            }

        })
        res.json(members)
    } )
    .catch(err => res.status(400).send((err).toString()));

});

router.route('/getAgencyInfos').post((req, res) => {
    const idAgency = req.body.idAgency;
    Agency.findOne({_id: ObjectId(idAgency)})
    .then(agency => res.json({ _id: agency._id, idAgency : agency.idAgency, name : agency.name, createdAt :agency.createdAt}) )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getAgencyAllStatsBySelDate').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const beginDate    = req.body.beginDate;
    Promise.all([

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",

            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                year: {$year: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] },
                
            }
        },
        {
            $match: {
                month : new Date(beginDate).getMonth() + 1,
                year : new Date(beginDate).getFullYear(),
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: 
                    {
                        idBroadcaster : "$idBroadcaster",
                        day: {$dayOfMonth: "$startAt"},
                        month: {$month: "$startAt"}, 
                        year: {$year: "$startAt"}
                    }, 
                    dailyPeriod : {$sum : "$period"},
                    dailyDiamonds : {$sum : "$streamDiamonds"},
                    memberStartDate1: { $push: "$startDate" }
                },
        },
        {
            $group:
                {
                    _id: "$_id.idBroadcaster", 
                    totalHours : {$sum : "$dailyPeriod"},
                    totalDiamond : {$sum : "$dailyDiamonds"},
                    totalDays : {$sum : 1},
                    memberStartDate: { $push: { $slice: ["$memberStartDate1", 1] } }
                },
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "_id",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {$unwind : "$broadcasterData"},
        {
            $project : {
                _id : 1,
                totalHours : 1,
                totalDiamond : 1,
                totalDays : 1,
                nickname : "$broadcasterData.nickname",
                picture : "$broadcasterData.picture",
                idb : "$broadcasterData.idBroadcaster",
                level : "$broadcasterData.stats.level",
                memberStartDate : {$slice: ["$memberStartDate", 1]},
            }
        }

    ]),

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "gifts",
                localField: "idBroadcaster",
                foreignField: "idReciever",
                as: "coinsVal"
            }
        },
        {$unwind : "$coinsVal"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                createdAt : 1,
                giftDiamonds : "$coinsVal.value",
                giftSendAt : "$coinsVal.createdAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$giftSendAt"},
                year: {$year: "$giftSendAt"},
                afterStart:  { $subtract: [ '$giftSendAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date(beginDate).getMonth() + 1,
                year : new Date(beginDate).getFullYear(),
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: "$idBroadcaster",
                    memberDiamonds : {$sum : "$giftDiamonds"},
                },
        },
    ])
    ])
    .then( ([members, coins]) => {
        members.forEach( (elem, index) => {
            let t = coins.filter(el => el._id == elem._id.toString());
            if (t.length > 0) {
                elem.totalDiamond = t[0].memberDiamonds;
            }
            if (t.length == 0) {
                elem.totalDiamond = 0;
            }

        })
        res.json(members)
    } )
    .catch(err => res.status(400).send((err).toString()));

});



router.route('/getAgencyTotalStatsByDate').post((req, res) => {
    const idAgency    = req.body.idAgency;
    const beginDate    = req.body.beginDate;

    Promise.all([

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "livestreams",
                localField: "idBroadcaster",
                foreignField: "idBroadcaster",
                as: "streams"
            }
        },
        {$unwind : "$streams"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                endAt : 1,
                streamDiamonds : "$streams.stats.diamonds",
                startAt : "$streams.startAt",
                endAt : "$streams.endAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$startAt"},
                year: {$year: "$startAt"},
                afterStart:  { $subtract: [ '$endAt', '$startDate' ] },
                period : { $subtract: [ '$endAt', '$startAt' ] }
            }
        },
        {
            $match: {
                month : new Date(beginDate).getMonth() + 1,
                year : new Date(beginDate).getFullYear(),
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
            {
                _id: 
                {
                    idBroadcaster : "$idBroadcaster",
                    day: {$dayOfMonth: "$startAt"},
                    month: {$month: "$startAt"}, 
                    year: {$year: "$startAt"}
                }, 
                dailyPeriod : {$sum : "$period"},
                dailyDiamonds : {$sum : "$streamDiamonds"},
            },
        },
        {
            $group:
            {
                _id: "$_id.idBroadcaster", 
                totalHoursByBroadcaster : {$sum : "$dailyPeriod"},
                totalDiamondByBroadcaster : {$sum : "$dailyDiamonds"},
            },
        },
        {
            $group:
            {
                _id: null, 
                totalHours : {$sum : "$totalHoursByBroadcaster"},
                totalDiamond : {$sum : "$totalDiamondByBroadcaster"},
                countMembers : {$sum : 1}
            },
        }

    ]),

    AgencyMembers.aggregate([
        {
            $match : {
                idAgency : ObjectId(idAgency)
            }
        },
        {
            $lookup:
            {
                from: "gifts",
                localField: "idBroadcaster",
                foreignField: "idReciever",
                as: "coinsVal"
            }
        },
        {$unwind : "$coinsVal"},
        {
            $project : {
                idAgency : 1,
                idBroadcaster : 1,
                startDate : 1,
                createdAt : 1,
                giftDiamonds : "$coinsVal.value",
                giftSendAt : "$coinsVal.createdAt",
            }
        },
        {
            $addFields: {
                month: {$month: "$giftSendAt"},
                year: {$year: "$giftSendAt"},
                afterStart:  { $subtract: [ '$giftSendAt', '$startDate' ] },
            }
        },
        {
            $match: {
                month : new Date(beginDate).getMonth() + 1,
                year : new Date(beginDate).getFullYear(),
                afterStart : {$gt : 0},
            }
        },
        {
            $group:
                {
                    _id: "$idBroadcaster",
                    memberDiamonds : {$sum : "$giftDiamonds"},
                },
        },
        {
            $group:
            {
                _id: null, 
                totalDiamond : {$sum : "$memberDiamonds"},
            },
        }

    ])
])
    .then( ([data, totalDiamonds]) => {
        if(data.length > 0){
            res.json({_id :null, totalHours:data[0].totalHours, totalDiamond : totalDiamonds[0].totalDiamond, countMembers: data[0].countMembers});
        }else{
            res.json({_id :null, totalHours:0, totalDiamond : 0, countMembers: 0});
        }
    })
    .catch(err => res.status(400).send((err).toString()));
});


module.exports = router;

const router = require('express').Router();
let GiftTransaction = require('../models/gifttransaction.model');
let Broadcaster = require('../models/brodcaster.model');
let LiveStream = require('../models/livestream.model');
var ObjectId = require('mongoose').Types.ObjectId; 
const RechargeTransaction = require('../models/rechargetransaction.model');
let Kingdom = require('../models/kingdom.model');
let kingdomTaskTransaction = require('../models/kingdomtasktransaction.model');

let moment = require('moment');

router.route('/getCoinsStat').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;

    GiftTransaction.aggregate(
        [   
            {$match: { idSender: ObjectId(idBroadcaster)} },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idReciever",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : "$broadcasterData"},
            {
                $sort : {
                    "createdAt" : -1
                }
            },
            {
                $group:
                {
                    _id: 
                    {
                        day: {$dayOfMonth: "$createdAt"},
                        month: {$month: "$createdAt"}, 
                        year: {$year: "$createdAt"}
                    }, 
                    actions: { 
                        $push:  { 
                            value: { 
                                $multiply: [ "$value", -1 ] 
                            }, 
                            picture: "$broadcasterData.picture",
                            nickname: "$broadcasterData.nickname",
                            inLiveStream : {
                                $gt: [ "$idLiveStream", null ] 
                            },
                            date : "$createdAt"
                        } 
                    }
                },
            },
            {
                $sort :{
                    "_id.year" : -1,
                    "_id.month" : -1,
                    "_id.day" : -1,
                }
            },
            {$skip : skip},
            {$limit : limit},
        ],
    )
    .then(gift => {
        res.json(gift);
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getDiamondsStat').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;
    GiftTransaction.aggregate(
        [   
            {$match: { idReciever : ObjectId(idBroadcaster)} },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : "$broadcasterData"},
            {
                $sort : {
                    "createdAt" : -1
                }
            },
            {
                $group:
                {
                    _id: 
                    {
                        day: {$dayOfMonth: "$createdAt"},
                        month: {$month: "$createdAt"}, 
                        year: {$year: "$createdAt"}
                    }, 
                    actions: { 
                        $push:  { 
                            value: "$value", 
                            picture: "$broadcasterData.picture",
                            nickname: "$broadcasterData.nickname",
                            inLiveStream : {
                                $gt: [ "$idLiveStream", null ] 
                            },
                            date : "$createdAt"
                        } 
                    }
                },
                
            },
            {
                $sort :{
                    "_id.year" : -1,
                    "_id.month" : -1,
                    "_id.day" : -1,
                }
            },
            {$skip : skip},
            {$limit : limit},
        ],
    )
    .then(gift => {
        res.json(gift);
    })
    .catch(err => {res.status(400).send((err).toString())});
});


//  to combine
router.route('/getDiamondsRankMonthly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    var rank = 0; 
    GiftTransaction.aggregate(
        [   
            {
                $addFields: {
                    month: {$month: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                    month : new Date().getMonth() + 1,
                    year : new Date().getFullYear(),
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idReciever",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idReciever",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               

        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getDiamondsRankWeekly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    var weekOfYear = function(){
        var d = new Date();
        d.setUTCHours(0,0,0);
        d.setDate(d.getDate()+4-(d.getDay()||7));
        return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
    };
    
    GiftTransaction.aggregate(
        [   
            {
                $addFields: {
                    week: {$week: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                   week : weekOfYear(new Date()),
                   year : new Date().getFullYear(),
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idReciever",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idReciever",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getDiamondsRankDaily').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    var start = new Date();
    start.setUTCHours(0,0,0,0);
    
    var end = new Date();
    end.setUTCHours(23,59,59,999);
    
    GiftTransaction.aggregate(
        [   
            {
                $match: {
                   createdAt : {$gte: start, $lt: end},
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idReciever",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idReciever",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getCoinsRankMonthly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    var rank = 0; 
    GiftTransaction.aggregate(
        [   
            {
                $addFields: {
                    month: {$month: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                    month : new Date().getMonth() + 1,
                    year : new Date().getFullYear(),
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               

        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getCoinsRankWeekly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    var weekOfYear = function(){
        var d = new Date();
        d.setUTCHours(0,0,0);
        d.setDate(d.getDate()+4-(d.getDay()||7));
        return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
    };
    
    GiftTransaction.aggregate(
        [   
            {
                $addFields: {
                    week: {$week: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                   week : weekOfYear(new Date()),
                   year : new Date().getFullYear(),
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getCoinsRankDaily').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    
    var start = new Date();
    start.setUTCHours(0,0,0,0);
    
    var end = new Date();
    end.setUTCHours(23,59,59,999);
    
    GiftTransaction.aggregate(
        [   
            {
                $match: {
                   createdAt : {$gte: start, $lt: end},
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getLevelStats').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    Broadcaster.aggregate(
        [   
            {
                $lookup:
                {
                    from: "followers",
                    localField: "_id",
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
                    _id: 
                    {
                        broadcasterId : "$_id",
                        avatar : "$picture",
                        nickname : "$nickname",
                        level : "$stats.level",
                    },
                    isFollower : "$isFollower"
                },
            },
            { $sort : { "_id.level" : -1 } },
            { $limit : 50 }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getRechargeRankMonthly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    RechargeTransaction.aggregate(
        [   
            {
                $addFields: {
                    month: {$month: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                    month : new Date().getMonth() + 1,
                    year : new Date().getFullYear(),
                    status : 1
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
            {$unwind : 
                {
                    path : "$broadcasterData",
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
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$coinValue"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } },
            { $limit : 50 }               

        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getRechargeRankWeekly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    var weekOfYear = function(){
        var d = new Date();
        d.setUTCHours(0,0,0);
        d.setDate(d.getDate()+4-(d.getDay()||7));
        return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
    };
    
    RechargeTransaction.aggregate(
        [   
            {
                $addFields: {
                    week: {$week: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                   week : weekOfYear(new Date()),
                   year : new Date().getFullYear(),
                   status : 1
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
            {$unwind : 
                {
                    path : "$broadcasterData",
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
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$coinValue"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            { $project : {"_id.followers" : 0}},
            { $sort : { total : -1 } },
            { $limit : 50 }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getRechargeRankDaily').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    
    var start = new Date();
    start.setUTCHours(0,0,0,0);
    
    var end = new Date();
    end.setUTCHours(23,59,59,999);
    
    RechargeTransaction.aggregate(
        [   
            {
                $match: {
                   createdAt : {$gte: start, $lt: end},
                   status : 1
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
            {$unwind : 
                {
                    path : "$broadcasterData",
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
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$coinValue"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } },
            { $limit : 50 }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getRechargeTotalRank').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    
    
    RechargeTransaction.aggregate(
        [   
            {
                $match: {
                   status : 1
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
            {$unwind : 
                {
                    path : "$broadcasterData",
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
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$coinValue"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } },
            { $limit : 50 }               
        ],
    )
    .then(broadcastersRank => {
        let currentRank = broadcastersRank.findIndex((element, index) => {
            return element._id.broadcasterId == idBroadcaster
        });
        res.json({broadcastersRank, currentRank : currentRank +1 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});


// top fans
router.route('/getTopFansRankMonthly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    GiftTransaction.aggregate(
        [   
            {
                $addFields: {
                    month: {$month: "$createdAt"},
                    year: {$year: "$createdAt"},
                }
            },
            {
                $match: {
                    month : new Date().getMonth() + 1,
                    year : new Date().getFullYear(),
                    idReciever : ObjectId(idBroadcaster),
                    idSender : { $ne: ObjectId(idBroadcaster) },
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               

        ],
    )
    .then(broadcastersRank => {
        res.json(broadcastersRank);
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getTopFansRankWeekly').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    const currentWeek = () =>
    {
        currentDate = new Date();
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
        var weekNumber = Math.ceil(days / 7);
        return weekNumber;
    }

    console.log(currentWeek());
    
    GiftTransaction.aggregate(
        [   
            {
                $addFields: {
                    week: {$week: "$createdAt"},
                    month: {$month: "$createdAt"},
                    year: {$year: "$createdAt"},

                }
            },
            {
                $match: {
                   week : currentWeek(),
                   month : new Date().getMonth() + 1,
                   year : new Date().getFullYear(),
                   idReciever : ObjectId(idBroadcaster),
                   idSender : { $ne: ObjectId(idBroadcaster) },
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {
        res.json(broadcastersRank);
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getTopFansRankDaily').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    
    var start = new Date();
    start.setUTCHours(0,0,0,0);
    
    var end = new Date();
    end.setUTCHours(23,59,59,999);
    
    GiftTransaction.aggregate(
        [   
            {
                $match: {
                   createdAt : {$gte: start, $lt: end},
                   idReciever : ObjectId(idBroadcaster),
                   idSender : { $ne: ObjectId(idBroadcaster) },
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {

        res.json(broadcastersRank);
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getTopFansRankHalfHour').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];

    GiftTransaction.aggregate(
        [   
            {
                $match: {
                   createdAt : { $gt: new Date(ISODate().getTime() - 1000 * 60 * 30)},
                   idReciever : ObjectId(idBroadcaster),
                   idSender : { $ne: ObjectId(idBroadcaster) },
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
                $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               
        ],
    )
    .then(broadcastersRank => {
        res.json(broadcastersRank);
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getTopFansRankTotal').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    var followerId = [ObjectId(idBroadcaster)];
    GiftTransaction.aggregate(
        [   
            {
                $match: {
                    idReciever : ObjectId(idBroadcaster),
                    idSender : { $ne: ObjectId(idBroadcaster) },
                }
            },
            {
                $lookup:
                {
                    from: "broadcasters",
                    localField: "idSender",
                    foreignField: "_id",
                    as: "broadcasterData"
                }
            },
            {$unwind : 
                {
                    path : "$broadcasterData",
                }
            },
            {
               $lookup:
                {
                    from: "followers",
                    localField: "idSender",
                    foreignField: "idFollowed",
                    as: "follower"
                }
            },  
            {
                $group:
                {
                    _id: 
                    {
                        broadcasterId : "$broadcasterData._id",
                        avatar : "$broadcasterData.picture",
                        nickname : "$broadcasterData.nickname",
                        level : "$broadcasterData.stats.level",
                        followers : "$follower"
                    }, 
                    total : {$sum : "$value"},
                },
                
            },   
            {
                $addFields:{
                   "isFollower" : {
                        $cond:[
                            {
                                $gt:[
                                    {
                                        $size: 
                                        {"$ifNull": [ {$setIntersection:["$_id.followers.idFollower", followerId]}, [] ]}
                                        
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
            {$project : {"_id.followers" : 0}},
            { $sort : { total : -1 } }               

        ],
    )
    .then(broadcastersRank => {
        res.json(broadcastersRank);
    })
    .catch(err => {res.status(400).send((err).toString())});
});





router.route('/getKingdomStats').post((req, res) => {
    
    Kingdom.find({kingdomType : 2}).sort({'stats.score': -1})
    .then(kingdom => {

        let kingdomData = [];
        kingdom.forEach(el => {
            let sc =  el.stats.score ?  el.stats.score : 0;
            kingdomData.push({ _id : {broadcasterId : el._id , avatar: el.kingdomPicture, nickname: el.kingdomName, level: null}, total : sc, isFollower : false })
        });

        res.json({ broadcastersRank : kingdomData, currentRank : 0 });
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getKingdomStatsWeek').post((req, res) => {

    let startDate = moment().startOf('week').utc().toString();
    let endDate = moment().endOf('week').utc().toString();

    kingdomTaskTransaction.aggregate([
        
        {
            $lookup:
            {
                from: "kingdoms",
                localField: "idKingdom",
                foreignField: "_id",
                as: "kingdomData"
            }
        },
        {$unwind : 
            {
                path : "$kingdomData",
            }
        },
        {
            $match : {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
                "kingdomData.kingdomType" : 2,
            }
        },
        { $group : {
            _id: 
                {
                    broadcasterId : "$kingdomData._id",
                    avatar : "$kingdomData.kingdomPicture",
                    nickname : "$kingdomData.kingdomName",
                    level :  "$kingdomData.kingdomName",
                }, 
            total:{$sum:"$value"},
            isFollower :{ $sum: 1 },
           
        }
           
        },
        { $sort : { total : -1 } },
        {$project : {"_id.followers" : 0}},
        

    ]).then(broadcastersRank => {
        res.json({broadcastersRank});
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getKingdomStatsMonth').post((req, res) => {

    let startDate = moment().utc().startOf('month').toString();
    let endDate = moment().utc().endOf('month').toString();

    kingdomTaskTransaction.aggregate([
        {
            $lookup:
            {
                from: "kingdoms",
                localField: "idKingdom",
                foreignField: "_id",
                as: "kingdomData"
            }
        },
        {$unwind : 
            {
                path : "$kingdomData",
            }
        },
        {
            $match : {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
                "kingdomData.kingdomType" : 2,
            }
        },
        { $group : {
            _id: 
                {
                    broadcasterId : "$kingdomData._id",
                    avatar : "$kingdomData.kingdomPicture",
                    nickname : "$kingdomData.kingdomName",
                    level :  "$kingdomData.kingdomName",
                }, 
            total:{$sum:"$value"},
            isFollower :{ $sum: 1 },
           
        }
           
        },
        {$project : {"_id.followers" : 0}},
        { $sort : { total : -1 } }   

    ]).then(broadcastersRank => {
        res.json({broadcastersRank});
    })
    .catch(err => {res.status(400).send((err).toString())});
});
   

module.exports = router;
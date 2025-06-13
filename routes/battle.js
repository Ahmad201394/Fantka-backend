const router = require('express').Router();
let BattleSession = require('../models/battlesession.model');
var ObjectId = require('mongoose').Types.ObjectId;


router.route('/getActifBattles').post((req, res) => {
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;

    BattleSession.aggregate([
        {
            $match : {status : 1}
        },
        {$skip : skip},
        {$limit : limit},

    ])
    .then(battles => res.json(battles) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getBattle').post((req, res) => {
    const idBattle    = req.body.idBattle ;

    BattleSession.aggregate([
        {
            $match : {status : 1, _id: ObjectId(idBattle)}
        },
        {
            $addFields: {
                currentDate: new Date(),
            }
        }
    ])
    .then(battles => res.json(battles) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getActifBattlesByIdLive').post((req, res) => {
    const idLive    = req.body.idLive;

    BattleSession.aggregate([
        {
            $match : { status : 1, battleStreams : { $elemMatch : { idLive : ObjectId(idLive)}} }
        },
        {
            $addFields: {
                currentDate: new Date(),
            }
        }
    ])
    .then(battles => res.json(battles) )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/updateGifters').post((req, res) => {
    const idAudiance    = req.body.idAudiance;
    const idStream  = req.body.idStream;
    const value     = req.body.value;
    const idBattle     = req.body.idBattle;
    
    var gifterData =  {
        idAudiance,
        idStream,
        value
    };
  
    BattleSession.findOne({_id: ObjectId(idBattle), gifters : {$elemMatch : { idAudiance : ObjectId(idAudiance), idStream : ObjectId(idStream) } }}, {"gifters.$" : 1})
    .then(gifter => {
        console.log(gifter)
      if(!gifter) 
        BattleSession.updateOne({_id: ObjectId(idBattle)},{$push: {gifters: gifterData}})
        .then(gifter =>  res.json(gifter))
        .catch(err => {res.status(400).send((err).toString())});
      else
        BattleSession.updateOne({_id: ObjectId(idBattle), gifters : {$elemMatch : { idAudiance : ObjectId(idAudiance), idStream : ObjectId(idStream) } }} , {$inc: { "gifters.$.value" : value }})
        .then(gifter =>  res.json(gifter))
        .catch(err => {res.status(400).send((err).toString())});
      }
    )
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getSortedGifters').post((req, res) => {
    const idBattle    = req.body.idBattle;
    const idStream    = req.body.idStream;
    
    BattleSession.aggregate([
        {
            $match : {_id : ObjectId(idBattle), gifters : { $elemMatch : { idStream : ObjectId(idStream)}}}
        },
        { $unwind: "$gifters" },
        {
            $match : {"gifters.idStream" : ObjectId(idStream)}
        },
        {
            $sort : {
                "gifters.value" : -1
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "gifters.idAudiance",
                foreignField: "_id",
                as: "gifterData"
            }
        },
        { $unwind: "$gifterData" },
        {
            $project : {
                gifterId : "$gifterData._id",
                picture :"$gifterData.picture",
                nickname :"$gifterData.nickname",
                value : "$gifters.value",
                level : "$gifterData.stats.level"
            }
        },
        // { $group: { _id: "$_id", gifter: { $push: "$gifter" } } },
        // { $project : {gifter: { $slice: [ "$gifter", 100 ]} }}

    ])
    .then(gifters =>  res.json(gifters))
    .catch(err => {res.status(400).send((err).toString())});
});

// router.route('/getSortedGiftersBoth').post((req, res) => {
//     const idBattle    = req.body.idBattle;
    
//     BattleSession.aggregate([
//         {
//             $match : {_id : ObjectId(idBattle)}
//         },
//         { $unwind: "$gifters" },
//         {
//             $sort : {
//                 "gifters.value" : -1
//             }
//         },
//         {
//             $lookup:
//             {
//                 from: "broadcasters",
//                 localField: "gifters.idAudiance",
//                 foreignField: "_id",
//                 as: "gifterData"
//             }
//         },  
//         {
//             $lookup:
//             {
//                 from: "broadcasters",
//                 localField: "gifters.idAudiance",
//                 foreignField: "_id",
//                 as: "gifterData"
//             }
//         },
//         { $unwind: "$gifterData" },
//         {
//             $project : {
//                 gifter : {
//                     idStream : "$gifters.idStream",
//                     gifterId : "$gifterData._id",
//                     picture :"$gifterData.picture",
//                     nickname :"$gifterData.nickname",
//                     value : "$gifters.value",
//                     level : "$gifterData.stats.level"
//                 }
//             }
//         },
//         {
//             $group : {
//                 _id: "$gifter.idStream",
//                 gifters: { $push: "$gifter" }
//             }
//         },

//     ])
//     .then(gifters =>  res.json(gifters))
//     .catch(err => {res.status(400).send((err).toString())});
// });


router.route('/getSortedGiftersBoth').post((req, res) => {
    const idBattle    = req.body.idBattle;
    
    BattleSession.aggregate([
        {
            $match : {_id : ObjectId(idBattle)}
        },
        { $unwind: "$gifters" },
        {
            $sort : {
                "gifters.value" : -1
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "gifters.idAudiance",
                foreignField: "_id",
                as: "gifterData"
            }
        },  
        
        { $unwind: "$gifterData" },
        {
            $project : {
                idStream : "$gifters.idStream",
                gifter : {
                    gifterId : "$gifterData._id",
                    picture :"$gifterData.picture",
                    nickname :"$gifterData.nickname",
                    value : "$gifters.value",
                    level : "$gifterData.stats.level"
                }
            }
        },
        {
            $group : {
                _id: "$idStream",
                gifters: { $push: "$gifter" },
                score : {$sum : "$gifter.value"}
            }
        },

    ])
    .then(gifters =>  res.json(gifters))
    .catch(err => {res.status(400).send((err).toString())});
});



router.route('/createBattle').post((req, res) => {
    const battleStreams = [
        req.body.streamer1, req.body.streamer2
    ]
    const startDate = Date.parse(new Date());
    const duration = 240;
    const status = 1;
    const anonymous = req.body.anonymous;
    var battleSession = new BattleSession({
        battleStreams : battleStreams,
        startDate,
        duration,
        anonymous,
        status,
    });
    battleSession.save()
    .then(battle =>  res.json(battle))
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/closeBattle').post((req, res) => {
    var idBattle = req.body.idBattle
    BattleSession.updateMany({_id : ObjectId(idBattle)},{$set : {status : 0}})
    .then(battle =>  res.json(battle))
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/closeBattleByStream').post((req, res) => {
    var idLive = req.body.idLive
    BattleSession.updateMany({ battleStreams : { $elemMatch : { idLive : ObjectId(idLive)}} }, {$set : {status : 0}})
    .then(battle =>  res.json(battle))
    .catch(err => {res.status(400).send((err).toString())});
});

module.exports = router;
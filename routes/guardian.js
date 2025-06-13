const router = require('express').Router();
let Gardians = require('../models/guardian.model');
let Broadcaster = require('../models/brodcaster.model');

var ObjectId = require('mongoose').Types.ObjectId; 

router.route('/').post((req, res) => {
    Gardians.find()
    .then(streams => res.json(streams))
    .catch(err => res.status(400).send((err).toString()));
});
  
router.route('/isGuardian').post((req, res) => {
    var idGuardian = req.body.idGuardian;
    var idGuardianOf = req.body.idGuardianOf;

    Gardians.findOne({idGuardian: ObjectId(idGuardian),idGuardianOf : ObjectId(idGuardianOf) })
    .then(guardian => {
        if (guardian) res.json({isGuardian : true, level : guardian.gardianLevel});
        else res.json({isGuardian : false});
    })
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getGuardians').post((req, res) => {
    var idGuardianOf = req.body.idGuardianOf;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;

    var globalQuery = [
        {
            $match : {
                idGuardianOf: ObjectId(idGuardianOf)
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idGuardian",
                foreignField: "_id",
                as: "guardianData"
            }
        },
        {
            $unwind : {path : "$guardianData", preserveNullAndEmptyArrays : true}
        },
        {
            $project : {
                guardianData : {
                "_id": 0,
                idDealer: 0,
                idBroadcaster: 0,
                biography: 0,
                phone: 0,
                localphone: 0,
                email: 0,
                sex: 0,
                birthday: 0,
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
        {$limit : limit},
        {$skip : skip}
    ];

    Gardians.aggregate(globalQuery)
    .then(guardians => {
        res.json(guardians);
    })
    .catch(err => res.status(400).send((err).toString()))
});


router.route('/getGuardianOf').post((req, res) => {
    var idGuardian = req.body.idGuardian;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;
    var globalQuery = [
        {
            $match : {
                idGuardian: ObjectId(idGuardian)
            }
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "idGuardianOf",
                foreignField: "_id",
                as: "guardianData"
            }
        },
        {
            $unwind : "$guardianData"
        },
        {
            $project : {
                guardianData : {
                    "_id": 0,
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
                    settings: 0
                }
            }
        },
        {$limit : limit},
        {$skip : skip}
    ];

    Gardians.aggregate(globalQuery)
    .then(guardians => {
        res.json(guardians);
    })
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/addGuardian').post((req, res) => {
    var idGuardian = req.body.idGuardian;
    var idGuardianOf = req.body.idGuardianOf;
    var level =  req.body.level;
    var gardian = new Gardians({
        idGuardian,
        idGuardianOf,
        level
    });
    
    gardian.save()
    .then(guardian => {
        res.json(guardian);
    }).catch(err => res.status(400).send((err).toString()));
});

router.route('/removeGuardian').post((req, res) => {
    var idGuardian = req.body.idGuardian;
    var idGuardianOf = req.body.idGuardianOf;
    Gardians.remove({idGuardian: ObjectId(idGuardian),idGuardianOf : ObjectId(idGuardianOf) })
    .then(guardian => { res.json(guardian);})
    .catch(err => res.status(400).send((err).toString()));
});

module.exports = router;

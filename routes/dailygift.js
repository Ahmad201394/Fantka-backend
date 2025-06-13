const router = require('express').Router();
let DailyGift = require('../models/dailygift.model');
let Broadcaster = require('../models/brodcaster.model');

var ObjectId = require('mongoose').Types.ObjectId; 

let moment = require('moment');


router.route('/').post((req, res) => {
    DailyGift.find()
    .then(gifts => res.json(gifts))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/hasTodayGift').post((req, res) => {
    const idBroadcaster  = req.body.idBroadcaster;
    var start = new Date();
    start.setUTCHours(0,0,0,0);
    
    var end = new Date();
    end.setUTCHours(23,59,59,999);
    let endDay = moment().utc().endOf('day').toString();
    console.log('daily gift', start, end, endDay);
    
    DailyGift.find({idBroadcaster : ObjectId(idBroadcaster), createdAt : {$gte: start, $lt: end}})
    .then(gifts => res.json(gifts.length > 0))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getTodayGift').post((req, res) => {
    const idBroadcaster  = req.body.idBroadcaster;

    Promise.all([
        new DailyGift({idBroadcaster : ObjectId(idBroadcaster)}).save(),
        Broadcaster.findOneAndUpdate({ _id : ObjectId(idBroadcaster)}, {$inc: { "stats.stars" : 5,  "stats.coins" : 1}}, {new :true}),
    ]).then(([addGift, broadcaster]) => res.json({addGift, broadcaster}))
    .catch(err => res.status(400).send((err).toString()));
});

module.exports = router;

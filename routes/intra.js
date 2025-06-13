const router = require('express').Router();

const Broadcaster = require('../models/brodcaster.model');
const SystemTransaction = require('../models/systemtransaction.model');
var ObjectId = require('mongoose').Types.ObjectId;

router.route('/addTransaction').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const type = req.body.type;
    const value = req.body.value;
    var transaction = new SystemTransaction({
        idBroadcaster,
        type,
        value,
    });

    Promise.all([
        Broadcaster.findOneAndUpdate({ _id : ObjectId(idBroadcaster)}, {$inc : {"stats.coins" : value}}, {new :true}),
        transaction.save()
    ]).then( ([ updateBroadcaster, pushTransaction ]) => {
        res.json(true)
    }).catch(err => res.status(400).send((err).toString()));
});

module.exports = router;

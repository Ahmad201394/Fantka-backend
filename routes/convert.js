const router = require('express').Router();
let ConvertTransaction = require('../models/converttransaction.model');
const Broadcaster = require('../models/brodcaster.model');
var ObjectId = require('mongoose').Types.ObjectId; 
var randtoken = require('rand-token').generator();

router.route('/').post((req, res) => {
    ConvertTransaction.find()
    .then(streams => res.json(streams))
    .catch(err => res.status(400).send((err).toString()));
});
  
router.route('/addConvertTransaction').post((req, res) => {
    const idTransaction     = randtoken.generate(9, "0123456789");
    const idBroadcaster     = req.body.idBroadcaster;
    const diamondValue      = req.body.diamondValue;
    const coinValue         = req.body.coinValue;
    const requestDate    =  Date.parse(new Date());
    const type    =  req.body.type; // coinToDiamond -- diamondToCoin
    
    let transaction = new ConvertTransaction({
        idTransaction,
        idBroadcaster,
        diamondValue,
        coinValue,
        requestDate,
        type
    });

    if(type == "coinToDiamond"){
        Broadcaster.updateOne({_id : ObjectId(idBroadcaster)},{$inc: { "stats.coins" : -coinValue,  "stats.realdiamonds" : diamondValue}})
        .then(updated => {
            if(updated.nModified == 1){
                transaction.save()
                .then(transaction => res.json(transaction))
                .catch(err => {res.status(400).send((err).toString())});
            }else{
                res.json("No Modification");
            }
        })
        .catch(err => {res.status(400).send((err).toString())});

    }else if(type == "diamondToCoin"){
        Broadcaster.updateOne({_id : ObjectId(idBroadcaster)},{$inc: { "stats.coins" : coinValue,  "stats.realdiamonds" : -diamondValue}})
        .then(updated => {
            if(updated.nModified == 1){
                transaction.save()
                .then(transaction => res.json(transaction))
                .catch(err => {res.status(400).send((err).toString())});
            }else{
                res.json("No Modification");
            }
        })
        .catch(err => {res.status(400).send((err).toString())});
    }else{
        res.json("wrong type");
    }
});


router.route('/addConvertToCoinItem').post((req, res) => {
    const coin    = req.body.coin;
    const diamond    = req.body.diamond;

    Settings.findOneAndUpdate({}, {
        $push : {
            convertToCoinItems :{
                coin,
                diamond
            }
        }
    },
    {new : true})
    .then(item => res.json(item))
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/addCashOutItem').post((req, res) => {
    const dollar    = req.body.dollar;
    const diamond    = req.body.diamond;
    
    Settings.findOneAndUpdate({}, {
        $push : {
            cashOutItems :{
                dollar,
                diamond
            }
        }
    },
    {new : true})
    .then(item => res.json(item))
    .catch(err => {res.status(400).send((err).toString())});
});

module.exports = router;

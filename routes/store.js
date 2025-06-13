const router = require('express').Router();
let Broadcaster = require('../models/brodcaster.model');
let Store = require('../models/store.model');
let MyBag = require('../models/mybag.model');
let StoreTransaction = require('../models/storeTransaction.model');
let Prizes = require('../models/prizes.model');
let PrizesCategory = require('../models/prizescategory.model');
var ObjectId = require('mongoose').Types.ObjectId; 
var path = require('path')
let multer = require("multer");

const Storage = multer.diskStorage({
  destination(req, file, callback){
    callback(null, 'public/uploads/store/');
  },
  filename(req, file, callback){
    callback(null,"prod-" + Date.now() + path.extname(file.originalname));
  }
});
var upload = multer({storage: Storage, limits: {fileSize: 1000000}});

router.route('/addTransaction').post((req, res) => {
  const idProduct    = req.body.productId;
  const idPrizeCat    = req.body.idPrizeCat;
  const prizeType = req.body.prizeType;
  const animationType = req.body.animationType;
  const idBroadcaster    = req.body.idBroadcaster;
  const quantity    = req.body.quantity;
  const value    = req.body.value;
  const duration    = req.body.duration;
  var currentDate = new Date();
  var storeTransaction = new StoreTransaction({
    idProduct,
    idBroadcaster,
    quantity,
    value,
  });
  var bagItem = {
    idPrize : idProduct,
    idPrizeCat : idPrizeCat,
    prizeType: prizeType,
    animationType : animationType,
    qty : quantity ,
    duration : duration,
    status : 0,
    start : Date.parse(new Date()) ,
    end : currentDate.setDate(currentDate.getDate() + parseInt(duration)) ,
  };

  Broadcaster.updateOne({_id : ObjectId(idBroadcaster)}, {$inc: { "stats.coins" : -value}})
  .then(updateBroadcaster => {
    Promise.all([
      storeTransaction.save(),
      MyBag.updateOne({idBroadcaster : ObjectId(idBroadcaster)}, {$push : {prizes : bagItem}}, {upsert : true})
    ])
    .then( ([ transaction, bagUpdate ]) => {
      res.json({transaction, bagUpdate })
    }).catch(err => res.status(400).send((err).toString()));
  })
  .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getCategories').post((req, res) => {
  PrizesCategory.aggregate([
    {
      $match :{
        "inStore.isInStore" : true
      }, 
    },
    {
      $sort : {
        "inStore.order" : 1
      }
    }, 
    {
      $project : {
        title : 1
      }
    }
  ])
  .then(categories => res.json(categories))
  .catch(err => {res.status(400).send((err).toString())});
});

router.route('/getProducts').post((req, res) => {
  const idCategory = req.body.idCategory;
  
  Prizes.find({idCategory : ObjectId(idCategory)})
  .then(products => res.json(products))
  .catch(err => {res.status(400).send((err).toString())});
});


module.exports = router;
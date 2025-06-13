const router = require('express').Router();
let GiftItem = require('../../models/gift.model');
var ObjectId = require('mongoose').Types.ObjectId;

var path = require('path');
let multer = require("multer");


const Storage = multer.diskStorage({
  destination(req, file, callback){
    callback(null, 'public/uploads/gifts/');
  },
  filename(req, file, callback){
    callback(null,"gift-" + Date.now() + path.extname(file.originalname));
  }
});
var upload = multer({storage: Storage, limits: {fileSize: 100000000 }});


router.route('/getGiftList').post((req, res) => {
   
    GiftItem.find({}, {gifts : 0})
    .then(cats => {
        res.json(cats)
    })
  .catch(err => res.status(400).send((err).toString()));
  
});

router.route('/getGiftByCategory').post((req, res) => {
    
    const cat = req.body.category;

    GiftItem.findOne({ _id: ObjectId(cat) })
    .then(gifts => {
        res.json(gifts)
    })
    .catch(err => res.status(400).send((err).toString()));
  
});


router.post('/uploadGiftMedia', upload.single('file'), function(req, res, next){

    var giftId = req.body.giftId;
    var giftName =  req.file.filename;
    var giftType =  req.body.typ;
    var giftCat =  req.body.cat;

    let update = {};

    if (giftType == 1) {
        update = { "gifts.$.icon": giftName }
    }

    if (giftType == 2) {
        update = { "gifts.$.animation": giftName }
    }

    if (giftType == 3) {
        update = { "gifts.$.audio": giftName }
    }

    GiftItem.updateOne({ _id: ObjectId(giftCat), gifts: { $elemMatch: { _id: ObjectId(giftId) } } },
    {
      $set: update
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
    

  });




module.exports = router;

const router = require('express').Router();
let Prizes = require('../../models/prizes.model');
let PrizesCategory = require('../../models/prizescategory.model');
let MyBag = require('../../models/mybag.model');
let Levels = require('../../models/levels.model');
var ObjectId = require('mongoose').Types.ObjectId;

var path = require('path');
let multer = require("multer");
const exp = require('constants');


const Storage = multer.diskStorage({
  destination(req, file, callback){
    callback(null, 'public/uploads/prizes/');
  },
  filename(req, file, callback){
    callback(null,"prz-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({storage: Storage, limits: {fileSize: 100000000 }});

router.route('/getCategories').post((req, res) => {
    PrizesCategory.aggregate([
      {
        $sort : {
          "inMyBag.order" : 1
        }
      }, 
      {
        $project : {
          title : 1,
          inMyBag : 1,
          inStore : 1,
          prizeType: 1,
        }
      }
    ])
    .then(categories => res.json(categories))
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getPrizeByCategory').post((req, res) => {
    const cat = req.body.category;

    Prizes.aggregate([
        {
            $match : {
                idCategory : ObjectId(cat)
            },
        },
      {
        $sort : {
          "inMyBag.order" : 1
        }
      }, 
      {
        $project : {
            title:1,
            icon:1,
            animation:1,
            audio:1,
            description:1,
            qty:1,
            duration:1,
            idCategory:1,
            prizeType: 1,
            inStore:1,
            inMyBag:1,
            value:1,
        }
      }
    ])
    .then(categories => res.json(categories))
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/addPrize').post((req, res) => {
    const data = req.body.data;
    console.log(data);

    const newPrize = new Prizes(data);

    newPrize.save()
    .then( prize => res.json(prize) )
    .catch(err => res.status(400).send((err).toString()));

   
});

router.post('/uploadPrizeMedia', upload.single('file'), function(req, res, next){

    var giftId = req.body.prizeId;
    var giftName =  req.file.filename;
    var giftType =  req.body.typ;


    let update = {};

    if (giftType == 1) {
        update = { icon: giftName }
    }

    if (giftType == 2) {
        update = { animation: giftName }
    }

    if (giftType == 3) {
        update = { audio: giftName }
    }

    Prizes.updateOne({ _id: ObjectId(giftId)},
    {
      $set: update
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
    

  });

  router.route('/getAllLevels').post((req, res) => {
  
    Levels.aggregate([
      {
        $sort : {
          "rank" : 1
        }
      }, 
      {
        $lookup:
        {
          from: "prizes",
          localField: "toObtain.idItem",
          foreignField: "_id",
          as: "prizeList"
        }
      },
      {
        $project : {
          rank : "$rank",
          expmin : "$expmin",
          expmax : "$expmax",
          toObtain : "$prizeList"
        }
      }
    ])
    .then(levels => res.json(levels))
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/addPrizeToLevel').post((req, res) => {
  
  var prizeId = req.body.prizeId;
  var levelId = req.body.levelId;

  Levels.updateOne({_id : ObjectId(levelId)}, { $push: { toObtain: { idItem : prizeId, qty : 1 } } })
  
  .then(levels => res.json(levels))
  .catch(err => {res.status(400).send((err).toString())});
});

router.route('/deletePrizeToLevel').post((req, res) => {
  
  var prizeId = req.body.prizeId;
  var levelId = req.body.levelId;

  Levels.updateOne({_id : ObjectId(levelId)}, { $pull: { toObtain: { idItem : ObjectId(prizeId) } } })
  
  .then(levels => res.json(levels))
  .catch(err => {res.status(400).send((err).toString())});
});


router.route('/addEditLevel').post((req, res) => {


  const levelID = req.body.levelID;
  const rank = req.body.rank;
  const expmin = req.body.expmin;
  const expmax = req.body.expmax;

  const datatoUpdate = {
    rank : parseInt(rank), expmin : parseInt(expmin), expmax : parseInt(expmax)
  };

  if (levelID == 0 ) {
    const dataToAdd = new Levels(datatoUpdate);
    dataToAdd.save()
    .then(levels => res.json(levels))
    .catch(err => {res.status(400).send((err).toString())});
  }
  else {
    Levels.updateOne({_id : ObjectId(levelID)}, { $set : datatoUpdate } )
    .then(levels => res.json(levels))
    .catch(err => {res.status(400).send((err).toString())});
  }
  

});


module.exports = router;
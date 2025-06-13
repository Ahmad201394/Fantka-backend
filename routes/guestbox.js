const router = require('express').Router();
var path = require('path')
let LiveStream = require('./../models/livestream.model');
let Broadcaster = require('./../models/brodcaster.model');
var ObjectId = require('mongoose').Types.ObjectId;


var currentBroadcasterBoxs = [];

router.route('/addBroadcasterBox').post((req, res) => {
  const idStream = req.body.idStream;
  const idBroadcaster = req.body.idBroadcaster;
  const maxCoins = req.body.maxCoins;
  const maxWinners = req.body.maxWinners;

  let newBox = {
    id : randtoken.generate(20, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
    idStream : idStream,
    maxCoins : maxCoins,
    maxWinners : maxWinners,
    maxWinValue : Math.floor(maxCoins / (maxWinners / 2)),
    broadcasters : []
  }

  const index = currentBroadcasterBoxs.findIndex((box) => box.idStream == idStream);

  if(currentBroadcasterBoxs.length > 0 && index != -1){
    currentBroadcasterBoxs[index] = newBox;
  }else{
    currentBroadcasterBoxs.push(newBox);
  }
  Broadcaster.updateOne({ _id : ObjectId(idBroadcaster)}, {$inc : {"stats.coins" : -maxCoins}})
  .then(broadcaster => { console.log(currentBroadcasterBoxs); res.json(newBox)})
  .catch(err => res.status(400).send((err).toString()));
});

router.route('/getBroadcasterBox').post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const idBox = req.body.idBox;
  const index = currentBroadcasterBoxs.findIndex((box) => box.id == idBox);

  if(currentBroadcasterBoxs.length > 0 
    && index != -1
    && currentBroadcasterBoxs[index].maxCoins != 0 
    && currentBroadcasterBoxs[index].broadcasters.length < Number(currentBroadcasterBoxs[index].maxWinners)
    && currentBroadcasterBoxs[index].broadcasters.findIndex((broadcaster) => broadcaster.idBroadcaster == idBroadcaster) == -1 ){
    const random = getRandomInt(1, currentBroadcasterBoxs[index].maxCoins > currentBroadcasterBoxs[index].maxWinValue ? currentBroadcasterBoxs[index].maxWinValue : currentBroadcasterBoxs[index].maxCoins);
    Broadcaster.updateOne({_id : ObjectId(idBroadcaster)}, {$inc : {"stats.coins" : random}})
    .then(broadcaster => {
      maxCoins = currentBroadcasterBoxs[index].maxCoins - random;
      currentBroadcasterBoxs[index].maxCoins = maxCoins;
      currentBroadcasterBoxs[index].broadcasters.push({idBroadcaster : ObjectId(idBroadcaster), value : random});
      res.json(random)
    })
    .catch(err => res.status(400).send((err).toString()));
    
  }else{
    res.json(-1)
  }

});

router.route('/getBroadcasterBoxsStats').post((req, res) => {
  const idBox = req.body.idBox;
  const index = currentBroadcasterBoxs.findIndex((box) => box.id == idBox);

  if(currentBroadcasterBoxs.length > 0 && index != -1){
    let broadcasterIds = [];
    currentBroadcasterBoxs[index].broadcasters.forEach((item, index) => {
      broadcasterIds.push(item.idBroadcaster)
    });
    
    Broadcaster.find({"_id" : {"$in" : broadcasterIds}}, {nickname : 1, picture : 1, "stats.level" : 1})
    .then(broadcasters => {
      let result = [];
      broadcasters.forEach((item) => {
        result.push({
          nickname : item.nickname,
          picture : item.picture,
          level : item.stats.level,
          value : currentBroadcasterBoxs[index].broadcasters[ currentBroadcasterBoxs[index].broadcasters.findIndex((broadcaster) => broadcaster.idBroadcaster == item._id.toString())].value
        });
      });
      res.json(result)
    } )
    .catch(err => res.status(400).send((err).toString()));
  }else{
    res.json(-1)
  }
});

router.route('/removeBroadcasterBox').post((req, res) => {
  const idBox = req.body.idBox;

  const filteredItems = currentBroadcasterBoxs.filter(item => item.id !== idBox);
  currentBroadcasterBoxs = filteredItems;
  res.json("done");
});


module.exports = router;
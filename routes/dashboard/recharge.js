const router = require('express').Router();

let adminUsers = require('../../models/adminuser.model');
let Broadcaster = require('../../models/brodcaster.model');
let Level = require('../../models/levels.model');
let RechargeTransaction = require('../../models/rechargetransaction.model');
let EditTransaction = require('./Edittransaction.model.js');

var ObjectId = require('mongoose').Types.ObjectId; 
const JWT =  require('jsonwebtoken');
const saltRounds = 10;
const bcrypt = require('bcrypt');
var randtoken = require('rand-token').generator();

router.route('/').post((req, res) => {
  console.log('adminuser')
    adminUsers.find({})
    .then(adminusers => res.json(adminusers))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getTransactionsByRecharger').post((req, res) => {
    RechargeTransaction.find({idRecharger : ObjectId(req.body.idRecharger)}).populate('idBroadcaster', ['picture', 'nickname', 'idBroadcaster', 'stats.coins']).populate('idRecharger', ['name']).sort({'updatedAt': -1})
    .then(rechargetransactions => res.json(rechargetransactions))
    .catch(err => res.status(400).send((err).toString()));
});



router.route('/removeTransaction').delete(function(req, res) {
  RechargeTransaction.remove({ _id: req.body.idTransaction }, function(err, result) {
    if (err) {
      console.err(err);
    } else {
      res.json(result);
    }
  });
});

router.route('/getEditTransactions').post((req, res) => {
    EditTransaction.find({}).populate('idBroadcaster', ['picture', 'nickname', 'idBroadcaster', 'stats.coins']).populate('idRecharger', ['name']).sort({'updatedAt': -1})
    .then(edittransactions => res.json(edittransactions))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/removeCoins').post(function(req, res) {
  const coinValue = req.body.coinValue;
  const idBroadcaster = req.body.idBroadcaster;
  const idRecharger = req.body.idRecharger;
  var RechargeObject = new EditTransaction({
	    idBroadcaster,
	    coinValue,
      idRecharger
    });
 RechargeObject.save()
    .then(recharge => {
        Promise.all([
            Broadcaster.updateOne({ _id: idBroadcaster }, {$inc: {"stats.coins" : coinValue} })
            ]).then( ([ res1, res2, res3, res4, res5, res6, res7 ]) => {
            res.json({ res1, res2, res3, res4, res5, res6, res7 })
        }).catch(err => res.status(400).send((err).toString()));
    })
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/addAdmin').post((req, res) => {
  
    var idAdminUser = randtoken.generate(9, "0123456789");  
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  
      const newAdminUser = new adminUsers({
        password  :  hash,
        name : req.body.name,
        email: req.body.email,
        level  :  req.body.level || 1,
        type : req.body.type,
      });
      
      newAdminUser.save()
      .then(adminUser => { 
          const id = adminUser._id;
          const token = JWT.sign({id}, process.env.JWTSECRET, {});
          const r = {isLogin : true, idAdminUser: adminUser._id, name : adminUser.name, email : adminUser.email, level : adminUser.level };
          res.json(r);
          }
      )
      .catch(err => res.status(400).send((err).toString()));
  
    });
  });


  router.route('/login').post((req, res) => {
    const user = req.body.login;
    const pass = req.body.password;
    adminUsers.findOne({email: user, type: 2})
    .then(adminUser => {
        if (adminUser) {
            bcrypt.compare(pass, adminUser.password, (error, response) => {
              if (response) {
                const id = adminUser._id;
                const token = JWT.sign({id}, process.env.JWTSECRET, {});
                const r = {isLogin : true, idAdminUser: adminUser._id, token : token , user: adminUser.name};
                res.json(r);
              }
              else {
                res.json({isLogin : false, message: "Wrong username/password combination!"})
              }
            });
        }
        else {
            res.json({isLogin : false, message: "Wrong username/password combination!"})
        }
    })
    .catch(err => res.status(400).send((err).toString()));  
  });




  router.route('/searchBroadcaster').post((req, res) => {
    var searchInput = req.body.searchInput;
    Broadcaster.aggregate([
      {
        $match : {
          $or: [ 
            { idBroadcaster: searchInput }, 
            { nickname:  searchInput } 
          ]
        }, 
      }, 
      {
        $project : {
          _id : 1,
          idBroadcaster : 1,
          nickname : 1,
          picture : 1,
          "stats.level" : 1,
          "stats.coins" : 1,
          "stats.diamonds": 1,
          "stats.realdiamonds": 1,
        }
      }
      ]
    )
      .then(broadcasters => { 
          res.json(broadcasters);
          }
      )
      .catch(err => res.status(400).send((err).toString()));
  });

  router.route('/sendCoins').post((req, res) => {
    const idBroadcaster = req.body.idBroadcaster;
    const coinValue = req.body.coinValue;
    const status = req.body.status;
    const idRecharger = req.body.idRecharger
    var RechargeObject = new RechargeTransaction({
	    idBroadcaster,
	    coinValue,
      status,
      idRecharger
    });
    RechargeObject.save()
    .then(recharge => {
        Promise.all([
            Broadcaster.updateOne({ _id: ObjectId(idBroadcaster) }, {$inc: {"stats.coins" : coinValue} })
           // (idLiveStream != null) ? LiveStream.updateOne({_id: ObjectId(idLiveStream), "streamers.idCoBroadcaster" : ObjectId(idReciever) },  { $inc: {"streamers.$.diamonds" : value} } ) : null,
           // (idLiveStream != null && idReciever == owner) ? LiveStream.updateOne({_id: ObjectId(idLiveStream), "audiance.idAudiance" : ObjectId(idSender) },  { $inc: {"audiance.$.sendedDiamond" : value} } ) : null,
           // (idLiveStream != null && idReciever == owner) ? LiveStream.updateOne({ _id:  ObjectId(idLiveStream) }, {$inc: {"stats.diamonds" : value} }) : null,
           // (idLiveStream != null && idRound != null) ? BattleSession.updateOne({ _id:  ObjectId(idRound), "battleStreams.idLive" : ObjectId(idLiveStream) }, {$inc: {"battleStreams.$.score" : value}} ) : null,
        ]).then( ([ res1]) => {
            res.json({ res1 })
        }).catch(err => res.status(400).send((err).toString()));
    })
    .catch(err => {res.status(400).send((err).toString())});
});

  module.exports = router;
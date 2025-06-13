const router = require('express').Router();

let adminUsers = require('../../models/adminuser.model');
let Broadcaster = require('../../models/brodcaster.model');
let Level = require('../../models/levels.model');
let RechargeTransaction = require('../../models/rechargetransaction.model');
let EditTransaction = require('./Edittransaction.model.js');
let Agency = require('../../models/agency.model');

var ObjectId = require('mongoose').Types.ObjectId; 
const JWT =  require('jsonwebtoken');
const saltRounds = 10;
const bcrypt = require('bcrypt');
var randtoken = require('rand-token').generator();



router.route('/login').post((req, res) => {
    const user = req.body.login;
    const pass = req.body.password;
    adminUsers.findOne({email: user, type: 1})
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


router.route('/getRechergers').post((req, res) => {
   
    adminUsers.find({type: 2}, {password: 0})
    .then(adminUser => {
        res.json(adminUser)
    })
    .catch(err => res.status(400).send((err).toString()));
    
});


router.route('/addAgency').post((req, res) => {
    
  const idAgency = randtoken.generate(9, "0123456789");  
  const phone = '---';
  const email = req.body.email;
  const login = req.body.email;
  const status = 1;
  const ownerId = req.body.ownerId;
  const name = req.body.name;
  const type = 1;
  const accountName = '---';
  const bankNum = '---';
  const bankName = '---';
  const bankAdress = '---';
  const bankSwift = '---';
  const billingAdress = '---';
  const pictureFront    = 'front.png';
  const pictureBack    = 'back.png';
  const pictureWithId   = 'id.png';

  bcrypt.hash(req.body.password.trim(), saltRounds, function(err, hash) {

      let newAgency = new Agency({
          idAgency ,
          phone ,
          email ,
          login,
          password : hash,
          status ,
          ownerId ,
          name ,
          pictureFront ,
          pictureBack ,
          pictureWithId ,
          accountInfo : {
              type : type,
              name : accountName,
              bankNum : bankNum,
              bankName : bankName,
              bankAdress : bankAdress,
              bankSwift : bankSwift,
              billingAdress : billingAdress,
          }
      })
      Agency.find({login})
      .then(agency => {
          if(agency.length === 0 ){
              newAgency.save()
              .then( newAgencySaved => res.json({ error: false, message: "Agency Created with success!", data : newAgencySaved }) )
              .catch(err => res.status(400).send((err).toString()));
          }else{
              res.json({ error: true, message: "Agency login Found!", data: {} })
          }
      })
      .catch(err => {res.status(400).send((err).toString())});
  });
});


router.route('/getAgencies').post((req, res) => {
   
  Agency.find({}, {password: 0})
  .then(agencies => {
      res.json(agencies)
  })
  .catch(err => res.status(400).send((err).toString()));
  
});



module.exports = router;
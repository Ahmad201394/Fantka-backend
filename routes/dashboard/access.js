const router = require('express').Router();
let adminUsers = require('../../models/adminuser.model');
let Broadcaster = require('../../models/brodcaster.model');

var ObjectId = require('mongoose').Types.ObjectId; 
const JWT =  require('jsonwebtoken');
const saltRounds = 10;
const bcrypt = require('bcrypt');
var randtoken = require('rand-token').generator();


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

  

  router.route('/adminLogin').post((req, res) => {
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


module.exports = router;
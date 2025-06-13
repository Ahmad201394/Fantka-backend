const router = require('express').Router();
var path = require('path')

let RechargeItem = require('../models/rechargeitem.model');
let RechargeTransaction = require('../models/rechargetransaction.model');

let Agency = require('../models/agency.model');
var ObjectId = require('mongoose').Types.ObjectId; 
let multer = require("multer");
var randtoken = require('rand-token').generator();
  
const Storage = multer.diskStorage({
    destination(req, file, callback){
        callback(null, 'public/uploads/agencyfiles/');
    },
    filename(req, file, callback){
        callback(null,"ag-" + Date.now() + randtoken.generate(5, "0AZERTYUIOPMLKJHGFDSQWXCVBNnbvcxwqsdfghjklmpoiuytreza123456789")  + path.extname(file.originalname));
    }
});

var upload = multer({storage: Storage, limits: {fileSize: 1000000}});
router.route('/addRechargeItem').post((req, res) => {

});
router.post('/addAgency', upload.fields([{ name: 'pictureFront', maxCount: 1 }, { name: 'pictureBack', maxCount: 1 }, { name: 'pictureWithId', maxCount: 1 }]), function(req, res, next){
    const idAgency = randtoken.generate(9, "0123456789");  
    const phone = req.body.phone;
    const email = req.body.email;
    const status = req.body.status;
    const ownerId = req.body.ownerId;
    const name = req.body.name;
    const type = req.body.type;
    const accountName = req.body.accountName;
    const bankNum = req.body.bankNum;
    const bankName = req.body.bankName;
    const bankAdress = req.body.bankAdress;
    const bankSwift = req.body.bankSwift;
    const billingAdress = req.body.billingAdress;
    const pictureFront    = req.files['pictureFront'][0].filename;
    const pictureBack    = req.files['pictureBack'][0].filename;
    const pictureWithId   = req.files['pictureWithId'][0].filename;

    let agency = new Agency({
        idAgency ,
        phone ,
        email ,
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
    agency.save()
    .then(agency => res.json(agency))
    .catch(err => {res.status(400).send((err).toString())});
});

module.exports = router;

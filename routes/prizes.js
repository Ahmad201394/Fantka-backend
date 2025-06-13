const router = require('express').Router();

let Prizes = require('../models/prizes.model');
let PrizesCategory = require('../models/prizescategory.model');
var ObjectId = require('mongoose').Types.ObjectId;

router.route('/').post((req, res) => {
    Prizes.find()
    .then(category => res.json(category) )
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/addPrizeCategory').post((req, res) => {
    const title = req.body.title;
    var prizeCategory = new PrizesCategory({
        title
    });
    prizeCategory.save()
    .then(category => res.json(category) )
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/delete').post((req, res) => {

    Prizes.updateMany({},{
        $set : {
            duration : 30
        }
    })
    .then(category => res.json(category) )
    .catch(err => {res.status(400).send((err).toString())});
});
router.route('/updatePrizeCategory').post((req, res) => {
    const isInStore = req.body.isInStore;
    const isInBag = req.body.isInBag;
    const order = req.body.order || null;
    const orderStore = req.body.orderStore;
    const idCategory = req.body.idCategory;
    const title = req.body.title;

    PrizesCategory.findOneAndUpdate({_id : ObjectId(idCategory)}, {
        $set : {
            inMyBag : {
                order : order,
                isInMyBag : isInBag
            },
            inStore : {
                isInStore : isInStore,
                order : orderStore
            },
            title : title
        }
    }, {new : true, upsert : true})
    .then(category => res.json(category) )
    .catch(err => {res.status(400).send((err).toString())});
});


module.exports = router;
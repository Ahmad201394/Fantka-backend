const router = require('express').Router();
let Slides = require('../models/slides.model');
var ObjectId = require('mongoose').Types.ObjectId; 

let moment = require('moment');


router.route('/').post((req, res) => {
    Slides.find()
    .then(sld => res.json(sld))
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/getSlideDetails').post((req, res) => {
    Slides.findOne({ _id : ObjectId(req.body.slideId) })
    .then(sld => res.json(sld))
    .catch(err => res.status(400).send((err).toString()));
});



router.route('/addSlide').post((req, res) => {

    let slds = new Slides({
        slideTitle : req.body.slideTitle,
        SlideDescription : req.body.SlideDescription,
        SlideCover : req.body.SlideCover,
        SlidePicture : req.body.SlidePicture,
        SlideLink : req.body.SlideLink,
        SlideType : req.body.SlideType,
    })

    slds.save()
    .then(sld => res.json(sld))
    .catch(err => res.status(400).send((err).toString()));
});



module.exports = router;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const slidesSchema = new Schema({
    slideTitle :  { type: String, required: true  },
    SlideDescription : { type: String },
    SlideCover : { type: String, required: true  },
    SlidePicture : { type: String },
    SlideLink : { type: String },
    SlideType : { type: Number, required: true },

}, {
    timestamps: true,
});

const Slides = mongoose.model('Slides', slidesSchema);

module.exports = Slides;

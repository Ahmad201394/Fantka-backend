const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const competitionSchema = new Schema({
    title    : { type: String, required: true },
    description   : { type: String, required: true },
    beginDate : { type: Date, required: true },
    endDate   : { type: Date, required: true },
    photoBanner    : { type: String, required: true },
    photoPrincipal    : { type: String, required: true },
    gifts : [],
    gifterMin :  { type: Number, required: true },
    broadcasterMin :  { type: Number, required: true },
    bgColor : { type: String },
    fgColor : { type: String },
    topGifter : [
        {
            rank : { type: Number },
            value : { type: Number },
            unity : { type: Number },
        }
    ],
    topBroadcaster : [
        {
            rank : { type: Number },
            value : { type: Number },
            unity : { type: Number },
        }
    ]
}, {
    timestamps: true,
});

const Competition = mongoose.model('Admin', competitionSchema);

module.exports = Competition;
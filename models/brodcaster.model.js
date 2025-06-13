const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const broadcasterSchema = new Schema({
    idDealer        : { type: Schema.Types.ObjectId },
    idBroadcaster   : { type: String, required: true },
    nickname        : { type: String, required: true },
    biography       : { type: String },
    phone           : { type: String },
    localphone      : { type: String },
    email           : { type: String },
    sex             : { type: String, required: true },
    birthday        : { type: Date, required: true },
    picture         : { type: String },
    country         : { type: String },
    countryCode     : { type: String },
    stats           : {
        liveStreams     : { type: Number, required: true },
        coins           : { type: Number, required: true, min: 0},
        diamonds        : { type: Number, required: true, min: 0},
        realdiamonds    : { type: Number, required: true, min: 0},
        following       : { type: Number, required: true },
        fans            : { type: Number, required: true },
        level           : { type: Number, required: true },
        stars           : { type: Number, required: true },
        exps            : { type: Number, required: true },
        expsMin         : { type: Number, required: true },
        expsMax         : { type: Number, required: true },
    },
    signupPosition : {
        lat : { type: Number, required: true },
        lon : { type: Number, required: true },
    },
    settings : {
        country     : { type: String },
        countryCode : { type: String },
        lang        : { type: String },
        idKingdom   : { type: Schema.Types.ObjectId },
        isLocation  : { type: Boolean },
        isInterest  : { type: Boolean },
        isBirthDay  : { type: Boolean },
        isZodiac    : { type: Boolean },
        isHidden    : { type: Boolean, default: false },
        delProfile  : { type: Date},
    },
    pictures : [
        {
            picture    : { type: String},
        }
    ],
    password    : { type: String, required: true },
    fbID        : { type: String },
    googleID    : { type: String },
    instaID     : { type: String },
    twID        : { type: String },
    appleID     : { type: String },
    pushToken   : { type: String },
    status      : { type: Number, required: true },
}, {
    timestamps: true,
});

const Broadcaster = mongoose.model('Broadcaster', broadcasterSchema);

module.exports = Broadcaster;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const agencySchema = new Schema({
    idAgency    : { type: String, required: true },
    name        : { type: String, required: true },
    phone       : { type: String, required: true },
    login       : { type: String, required: true },
    email       : { type: String, required: true },
    password    : { type: String},
    status      : { type: Number, required: true }, 
    pictureFront      : { type: String, required: true }, 
    pictureBack      : { type: String, required: true }, 
    pictureWithId      : { type: String, required: true },
    ownerId     : { type: Schema.Types.ObjectId, required: true },
    accountInfo : {
        type :{ type:  String, required: true },
        name : { type: String, required: true },
        bankNum :{ type:  String, required: true },
        bankName : { type: String, required: true },
        bankAdress :{ type:  String, required: true },
        bankSwift : { type: String, required: true },
        billingAdress : { type: String, required: true },
    },
}, {
    timestamps: true,
});

const Agency = mongoose.model('Agency', agencySchema);

module.exports = Agency;


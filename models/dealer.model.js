const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dealerSchema = new Schema({
    idDealer   : { type: Schema.Types.ObjectId, required: true },
    name        : { type: String, required: true },
    phone       : { type: String, required: true },
    email       : { type: String, required: true },
    country     : { type: String, required: true },
    password    : { type: String, required: true },
    status      : { type: String, required: true }, // { type: Number, min: 18, max: 65 },
}, {
    timestamps: true,
});

const Dealer = mongoose.model('Dealer', dealerSchema);

module.exports = Dealer;
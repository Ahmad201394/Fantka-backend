const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const agencySchema = new Schema({
    dollarToCoin    : { type: Number, required: true },
    coinToDiamond        : { type: Number, required: true },
    diamondToCoin       : { type: Number, required: true },
    diamondToDollar       : { type: Number, required: true },
    rechargeItems : [
        {
            price       : { type: Number, required: true },
            coinValue        : { type: Number, required: true },
        }
    ],
    convertToCoinItems : [
        {
            coin       : { type: Number, required: true },
            diamond        : { type: Number, required: true },
        }
    ],
    cashOutItems : [
        {
            dollar       : { type: Number, required: true },
            diamond        : { type: Number, required: true },
        }
    ],
}, {
    timestamps: true,
});

const Agency = mongoose.model('Agency', agencySchema);

module.exports = Agency;
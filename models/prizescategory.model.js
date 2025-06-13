const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prizesCategorySchema = new Schema({
    prizeType   : { type: String, required: true },
    title       : { type: String, required: true },
	icon        : { type: String},
    inStore : {
        isInStore : { type: Boolean},
        order : { type: Number}
    },
    inMyBag : {
        isInMyBag : { type: Boolean},
        order : { type: Number}
    }
}, {
    timestamps: true,
});

const PrizesCategory = mongoose.model('PrizesCategory', prizesCategorySchema);

module.exports = PrizesCategory;
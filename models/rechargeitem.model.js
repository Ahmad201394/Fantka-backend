const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rechargeItemSchema = new Schema({
    price       : { type: Number, required: true },
	coinValue        : { type: Number, required: true },
}, {
    timestamps: true,
});

const RechargeItem = mongoose.model('RechargeItem', rechargeItemSchema);

module.exports = RechargeItem;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const giftItemSchema = new Schema({
    title : { type: String, required: true },
    type : {type: Number, required: true },
    gifts: [
        {
            title       : { type: String, required: true },
            icon        : { type: String },
            animation   : { type: String },
            audio       : { type: String },
            value       : { type: Number, required: true },
            type        : { type: Number, required: true },
            quantities : { type: [Number] }
        }
    ]
}, {
    timestamps: true,
});

const GiftItem = mongoose.model('GiftItem', giftItemSchema);

module.exports = GiftItem;

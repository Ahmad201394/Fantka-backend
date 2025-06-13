const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const giftSchema = new Schema({
    idReciever   : { type: Schema.Types.ObjectId, required: true },
    idLiveStream : { type: Schema.Types.ObjectId },
    idKingdom    : { type: Schema.Types.ObjectId },
    idSender     : { type: Schema.Types.ObjectId, required: true },
    idGift       : { type: Schema.Types.ObjectId, required: true },
    quantity     : { type: Number, required: true },
    value        : { type: Number, required: true },
}, {
    timestamps: true,
});

const GiftTransaction = mongoose.model('Gift', giftSchema);

module.exports = GiftTransaction;
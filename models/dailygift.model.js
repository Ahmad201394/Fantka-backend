const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dailyGiftSchema = new Schema({
    idBroadcaster : { type: Schema.Types.ObjectId, required: true },
}, {
    timestamps: true,
});

const DailyGift = mongoose.model('DailyGift', dailyGiftSchema);

module.exports = DailyGift;

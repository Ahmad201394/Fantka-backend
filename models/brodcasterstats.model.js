const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const broadcasterStatsSchema = new Schema({
    idBroadcaster : { type: Schema.Types.ObjectId, required: true },
    liveStreamNumber : { type: Number, required: true },
    coins       : { type: Number, required: true, min: 0},
    diamonds    : { type: Number, required: true, min: 0},
    following   : { type: Number, required: true },
    fans        : { type: Number, required: true },
    level       : { type: Number, required: true },
    badge       : { type: Schema.Types.ObjectId, required: true },
}, {
    timestamps: true,
});

const BroadcasterStats = mongoose.model('BroadcasterStats', broadcasterStatsSchema);

module.exports = BroadcasterStats;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const battleBeamSchema = new Schema({
    idChannel   : { type: String, required: true },
    idBroadcaster : { type: Schema.Types.ObjectId, required: true },
    idLiveStream : { type: Schema.Types.ObjectId, required: true },
    joinedLivestream : { type: Schema.Types.ObjectId, required: true },
    joinedBroadcaster : { type: Schema.Types.ObjectId, required: true },
}, {
    timestamps: true,
});

const BattleBeam = mongoose.model('BattleBeam', battleBeamSchema);

module.exports = BattleBeam;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const battleSessionSchema = new Schema({
    battleStreams : [
        {
            idLive : { type: Schema.Types.ObjectId },
            idBroadcaster: { type: Schema.Types.ObjectId },
            nickname : { type: String },
            picture : { type: String },
            uid :  { type: String },
            channel :  { type: String },
            token : { type: String },
            score : { type: Number},
        }
    ],
    startDate : {type : Date},
    duration : { type: Number},
    anonymous : {type: Boolean},
    gifters : [
        {
            idAudiance : { type: Schema.Types.ObjectId },
            idStream : { type: Schema.Types.ObjectId },
            value : { type: Number},
        }
    ],
    status : { type: Number},
}, {
    timestamps: true,
});

const BattleSession = mongoose.model('BattleSession', battleSessionSchema);

module.exports = BattleSession;

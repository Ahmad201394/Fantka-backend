const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const liveStreamSchema = new Schema({
    agoraStreamId   : { type: String, required: true },
    agoraChannelId  : { type: String, required: true },
    agoraToken      : { type: String, required: true },
    idBroadcaster   : { type: Schema.Types.ObjectId, required: true },
    aboutStream     : { type: String},
    picture         : { type: String },
    streamType      : { type: String, required: true },
    category        : { type: Schema.Types.ObjectId, required: true },
    multibeamLayout : { type: Number, required: true },
    streamPosition  : {
        lat     : { type: String, required: true },
        lon     : { type: String, required: true },
    },
    stats  : {
        coins       : { type: Number, required: true },
        diamonds    : { type: Number, required: true },
        fans        : { type: Number, required: true },
        stars       : { type: Number, required: true },
    },
    streamControl  : {
        isVideo      : { type: Boolean, required: true },
        isMute       : { type: Boolean, required: true },
        isMirror     : { type: Number, required: true },
    },
    audiance: [
        {
            idAudiance      : { type: Schema.Types.ObjectId, required: true },
            nickname        : { type: String },
            picture         : { type: String },
            sendedDiamond   : { type: Number },
            guardian        : { type: Number },
            join_at         : { type: Date, required: true },
            left_at         : { type: Date },
            status          : { type: Number, required: true },
        }
    ],    
    streamers: [
        {
            idCoBroadcaster : { type: Schema.Types.ObjectId, required: true },
            liveUid : { type: String },
            nickname : { type: String },
            diamonds : { type: Number },
            picture : { type: String },
            join_at : { type: Date, required: true },
            left_at : { type: Date },
            status  : { type: Number, required: true },
            isVideo : { type: Boolean, required: true },
            isMute  : { type: Boolean, required: true },
            isMirror : { type: Number, required: true },
        }
    ],    
    gifters : [
        {
            gifterId : { type: Schema.Types.ObjectId, required: true },        
            gifterAvatar : { type: String },
            gifterName : { type: String },
            reciverId : { type: Schema.Types.ObjectId, required: true },  
            giftValue : { type: Number },
        }    
    ],
    options : {
        decorRoom  : { type: String},
    },
    isInBattle : { type: Schema.Types.ObjectId},
    isVisible : { type: Boolean, default: true},
    status      : { type: Number, required: true, min : 0, max : 1 },
    startAt     : { type: Date, required: true },
    endAt       : { type: Date },

}, {
    timestamps: true,
});

const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

module.exports = LiveStream;
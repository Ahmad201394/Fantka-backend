const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const broadcasterSettingsSchema = new Schema({
    broadcasterId : { type: Schema.Types.ObjectId },
    general : {
        friendsInvitation : { type: Boolean},
        newFans : {type : Boolean},
    },
    notification : {
        privateMessages : { type: Boolean},
        anonymousMessages : {type : Boolean},
        systemMessages : {type : Boolean},
        followers : [
           "Schema.Types.ObjectId"
        ],
    },
    privacy : {
        lastActifTime : {type : Boolean},
        onlineStatus : {type : Boolean},
        callsOff : {type : Boolean},
    }
}, {
    timestamps: true,
});

const broadcasterSettings = mongoose.model('broadcasterSettings', broadcasterSettingsSchema);

module.exports = broadcasterSettings;

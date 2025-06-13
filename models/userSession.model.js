const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSessionSchema = new Schema({
    idBroadcaster: { type: Schema.Types.ObjectId, required: true },
    deviceId   : { type: String, required: true },
    token : { type: String, required: true },
}, {
    timestamps: true,
});

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;
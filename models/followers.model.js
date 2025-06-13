const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const followersSchema = new Schema({
    idLiveStream : { type: Schema.Types.ObjectId },
    idFollowed : { type: Schema.Types.ObjectId, required: true },
    idFollower  : { type: Schema.Types.ObjectId, required: true },
}, {
    timestamps: true,
});

const Followers = mongoose.model('Followers', followersSchema);

module.exports = Followers;
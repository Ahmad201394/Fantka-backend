const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const liveCommentSchema = new Schema({
    idLiveStream : { type: Schema.Types.ObjectId, required: true },
    idAudience  : { type: Schema.Types.ObjectId, required: true },
    message      : { type: String, required: true },
}, {
    timestamps: true,
});

const LiveComment = mongoose.model('LiveComment', liveCommentSchema);

module.exports = LiveComment;
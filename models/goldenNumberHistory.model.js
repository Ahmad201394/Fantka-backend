const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const goldenNumberHistorySchema = new Schema({
    idBroadcaster   : { type: Schema.Types.ObjectId, required: true },
    idAdmin : { type: String},
    oldID   : { type: String, required: true },
    newID     : { type: String, required: true },

}, {
    timestamps: true,
});

const GoldenNumberHistory = mongoose.model('goldenNumberHistory', goldenNumberHistorySchema);

module.exports = GoldenNumberHistory;
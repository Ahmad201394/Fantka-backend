const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const goldenNumbersSchema = new Schema({
    idBroadcaster   : { type: Schema.Types.ObjectId, required: true },
    // idBroadcaster   : { type: String, required: true },
    oldID           : { type: String, required: true },
    NewID           : { type: String, required: true },
    state           : { type: Number, required: true },
}, {
    timestamps: true,
});

const GoldenNumbers = mongoose.model('GoldenNumbers', goldenNumbersSchema);

module.exports = GoldenNumbers;
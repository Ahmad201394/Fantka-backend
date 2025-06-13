const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const historySchema = new Schema({
    idProfile: { type: Schema.Types.ObjectId, required: true },
    idViewer: { type: Schema.Types.ObjectId, required: true },
    visitCount : { type: Number, required: true },
    date       : { type: Date, required: true},
}, {
    timestamps: true,
});

const History = mongoose.model('Hystory', historySchema);

module.exports = History;

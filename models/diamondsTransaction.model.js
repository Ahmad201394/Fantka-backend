const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const diamondsTransactionSchema = new Schema({
    idSender    : { type: Schema.Types.ObjectId, required: true },
    idReciever  : { type: Schema.Types.ObjectId, required: true },
    idStream    : { type: Schema.Types.ObjectId},
    value       : { type: String, required: true },
}, {
    timestamps: true,
});

const DiamondsTransaction = mongoose.model('DiamondsTransaction', diamondsTransactionSchema);

module.exports = DiamondsTransaction;
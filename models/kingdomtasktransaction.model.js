const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const kingdomTaskTransactionSchema = new Schema({
    idTask : { type: Schema.Types.ObjectId, required: true },
    idBroadcaster : { type: Schema.Types.ObjectId, required: true },
    idKingdom : { type: Schema.Types.ObjectId },
    value : { type: Number },
    state : { type: Number },
}, {
    timestamps: true,
});

const kingdomTaskTransaction = mongoose.model('kingdomTaskTransaction', kingdomTaskTransactionSchema);

module.exports = kingdomTaskTransaction;
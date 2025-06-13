const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const storeTransactionSchema = new Schema({
    idBroadcaster: { type: Schema.Types.ObjectId, required: true },
    idProduct      : { type: Schema.Types.ObjectId, required: true },
    quantity     : { type: Number, required: true },
    value        : { type: Number, required: true },
}, {
    timestamps: true,
});

const StoreTransaction = mongoose.model('StoreTransaction', storeTransactionSchema);

module.exports = StoreTransaction;
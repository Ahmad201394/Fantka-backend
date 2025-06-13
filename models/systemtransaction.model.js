const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const systemTransactionSchema = new Schema({
    idBroadcaster   : { type: Schema.Types.ObjectId, required: true },
    type            : { type: Number, required: true },
    value           : { type: Number, required: true },
}, {
    timestamps: true,
});

const SystemTransaction = mongoose.model('System', systemTransactionSchema);

module.exports = SystemTransaction;

/*
type :
    1 => daily gift
    2 => system box
    3 => flying comment
    4 => global message
*/

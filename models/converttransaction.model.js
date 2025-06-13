const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const convertTransactionSchema = new Schema({
    idTransaction :{ type: String, required: true },
	idBroadcaster : { type: Schema.Types.ObjectId, required: true },
    diamondValue : { type: Number, required: true },
	coinValue   : { type: Number, required: true },
	requestDate : { type: Date, required: true },
	type : { type: String, required: true },
}, {
    timestamps: true,
});

const ConvertTransaction = mongoose.model('ConvertTransaction', convertTransactionSchema);

module.exports = ConvertTransaction;
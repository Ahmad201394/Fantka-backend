const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rechargeTransactionSchema = new Schema({
    idBroadcaster:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Broadcaster'
    },
    idRecharger:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Admin'
    },
    idKingdom   : { type: Schema.Types.ObjectId },
	coinValue   : { type: Number, required: true },
	status : { type: Number, required: true }
}, {
    timestamps: true,
});

const RechargeTransaction = mongoose.model('RechargeTransaction', rechargeTransactionSchema);

module.exports = RechargeTransaction;
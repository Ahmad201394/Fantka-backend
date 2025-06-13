const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const systemRechargeSchema = new Schema({
    idBroadcaster:{
        type: mongoose.Schema.Types.ObjectId
    },
    transactionRef : { type: String, required: true },
    transactionId : { type: String, required: true },
	coinValue   : { type: Number, required: true },
    price   : { type: Number, required: true },
	status : { type: Number, required: true }
}, {
    timestamps: true,
});

const SystemRecharge = mongoose.model('SystemRecharge', systemRechargeSchema);

module.exports = SystemRecharge;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const editTransactionSchema = new Schema({
    idBroadcaster:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Broadcaster'
    },
    idRecharger:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Admin'
    },
	coinValue   : { type: Number, required: true }
}, {
    timestamps: true,
});

const EditTransaction = mongoose.model('EditTransaction', editTransactionSchema);

module.exports = EditTransaction;
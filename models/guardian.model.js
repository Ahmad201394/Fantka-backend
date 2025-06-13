const { number } = require('assert-plus');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const gardiansSchema = new Schema({
    idGuardian : { type: Schema.Types.ObjectId, required: true },
    idGuardianOf  : { type: Schema.Types.ObjectId, required: true },
    gardianLevel  : { type: Number, required: true },
}, {
    timestamps: true,
});

const Guardiens = mongoose.model('Guardiens', gardiansSchema);

module.exports = Guardiens;
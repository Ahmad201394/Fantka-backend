const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const levelsSchema = new Schema({
    rank : { type: Number, required: true },
    expmin : { type: Number, required: true },
    expmax  : { type: Number, required: true },
    toObtain : [
        {
            idItem : { type: Schema.Types.ObjectId },
            qty : { type: Number, required: true },
        }
    ]
}, {
    timestamps: true,
});

const Levels = mongoose.model('Levels', levelsSchema);

module.exports = Levels;
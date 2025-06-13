const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const storeSchema = new Schema({
    title : { type: String, required: true },
    products : [
        {
            title       : { type: String, required: true },
            icon        : { type: String, required: true },
            animation   : { type: String },
            value       : { type: Number, required: true },
            description : { type: Number },
            duration    : { type: Number },
            idPrizeCat  : { type: Schema.Types.ObjectId, required: true },
            promo : [
                {
                    startDate :  { type: Date, required: true },
                    endDate :  { type: Date, required: true },
                    value : { type: Number, required: true },
                }
            ]
        }
    ]
}, {
    timestamps: true,
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
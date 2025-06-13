const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const myBagSchema = new Schema({
    idBroadcaster : { type: Schema.Types.ObjectId, required: true },
	prizes : [
        {
            idPrize : { type: Schema.Types.ObjectId, required: true }, 
            idPrizeCat  : { type: Schema.Types.ObjectId},
            prizeType   : { type: String, required: true },
            animationType : { type: String },
            qty : { type: Number }, 
            duration  : { type: Number},
            start : {type : Date},
            end : {type : Date},
            status : { type: Number},
        }
	]

}, {
    timestamps: true,
});

const MyBag = mongoose.model('MyBag', myBagSchema);

module.exports = MyBag;
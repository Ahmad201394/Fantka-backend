const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prizesSchema = new Schema({
    title       : { type: String, required: true },
	icon        : { type: String },
	animation   : { type: String },
	audio   	: { type: String },
	description : { type: String },
	qty         : { type: Number },
	duration    : { type: Number },
	idCategory  : { type: Schema.Types.ObjectId},
	prizeType   : { type: String, required: true },
	animationType   : { type: String },
	inStore : { type: Boolean },
	inMyBag : { type: Boolean },
	value : { type : Number },
	
}, {
    timestamps: true,
});

const Prizes = mongoose.model('Prizes', prizesSchema);

module.exports = Prizes;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const agencyRequestSchema = new Schema({
    idAgency  : { type: Schema.Types.ObjectId, required: true },
    idBroadcaster  : { type: Schema.Types.ObjectId, required: true },
    status :  { type: Number, required: true  }

}, {
    timestamps: true,
});

const AgencyRequest = mongoose.model('AgencyRequest', agencyRequestSchema);

module.exports = AgencyRequest;


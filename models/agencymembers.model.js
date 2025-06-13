const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const agencyMembersSchema = new Schema({
    idAgency  : { type: Schema.Types.ObjectId, required: true },
    idBroadcaster  : { type: Schema.Types.ObjectId, required: true },
    status :  { type: Number, required: true  },
    startDate : { type: Date, required: true  },

}, {
    timestamps: true,
});

const AgencyMembers = mongoose.model('AgencyMembers', agencyMembersSchema);

module.exports = AgencyMembers;

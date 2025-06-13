const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const visitProfileSchema = new Schema({
    idProfile: { type: Schema.Types.ObjectId, required: true },
    idViewer: { type: Schema.Types.ObjectId, required: true },
    visitCount : { type: Number, required: true },
    date       : { type: Date, required: true},
}, {
    timestamps: true,
});

const VisitProfile = mongoose.model('VisitProfile', visitProfileSchema);

module.exports = VisitProfile;

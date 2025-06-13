const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reportSchema = new Schema({
    reportedId    : { type: Schema.Types.ObjectId, required: true },
    reportedVisibleId    : { type: String, required: true },
    reportedBy   : { type: Schema.Types.ObjectId, required: true },
    reprtedWhy: [
        { type: String }
    ]

}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
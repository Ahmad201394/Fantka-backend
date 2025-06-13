const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const smsTokenSchema = new Schema({
    token : { type: String, required: true},
    phone : { type: String, required: true },
    code : { type: String, required: true },
}, {
    timestamps: true,
});

const SmsToken = mongoose.model('SmsToken', smsTokenSchema);

module.exports = SmsToken;
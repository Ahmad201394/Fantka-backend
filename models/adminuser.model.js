const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name    : { type: String, required: true },
    email   : { type: String, required: true },
    password: { type: String, required: true },
    level   : { type: Number, required: true },
    type    : { type: Number, required: true },
}, {
    timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
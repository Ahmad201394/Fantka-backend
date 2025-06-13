const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const superAdminSchema = new Schema({
    name    : { type: String, required: true },
    userName    : { type: String, required: true },
    password    : { type: String, required: true },
    level   : { type: Number},
}, {
    timestamps: true,
});

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = SuperAdmin;
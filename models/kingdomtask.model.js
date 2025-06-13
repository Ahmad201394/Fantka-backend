const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const kingdomTaskSchema = new Schema({
    icon : { type: String, required: true },
    title : { type: String, required: true },
    value : { type: Number },
    loop : { type: Number },
    type : { type: Number },
}, {
    timestamps: true,
});

const kingdomTask = mongoose.model('kingdomTask', kingdomTaskSchema);

module.exports = kingdomTask;
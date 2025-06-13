const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminManagerSchema = new Schema({
    broadcasterId : { type: Schema.Types.ObjectId },
    admins : [
        {
            adminId : { type: Schema.Types.ObjectId, required: true },
            level : {type : Number},
            date : {type : Date}
        }
    ],
    blocked : [
        {
            blockedId : { type: Schema.Types.ObjectId, required: true },
            bockedBy:{ type: String, required: true },
            status : {type : Number},
            date : {type : Date}
        }
    ],
}, {
    timestamps: true,
});

const adminManager = mongoose.model('adminManager', adminManagerSchema);

module.exports = adminManager;


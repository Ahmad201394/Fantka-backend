const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    from    : { type: Schema.Types.ObjectId},
    to      : { type: Schema.Types.ObjectId},
    message : { type: String, required: true },
    icon    : { type: String, required: true },
    system  : { type: Boolean, required: true},
    status  : { type : Number } 
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
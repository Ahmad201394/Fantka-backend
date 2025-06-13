const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    idKingdom : { type: Schema.Types.ObjectId},
    participants : [ Schema.Types.ObjectId ],
    deleted : [
        {
            userID : { type: Schema.Types.ObjectId},
            deletedAt : { type: Date}
        }
    ]
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messagesSchema = new Schema( {
    idConversation : { type: Schema.Types.ObjectId, required : true },
    sender      : { type: Schema.Types.ObjectId, required : true },
    message     : { type: String },
    image       : { type: String},
    video       : { type: String},
    audio       : { type: String},
    gift        : { type: String},
    hideFrom    :  [Schema.Types.ObjectId ],
    viewed      :  [{ 
        idBroadcaster : { type: Schema.Types.ObjectId },
        at : {type: Date, default: Date.now, required : true} 
    }],
},
{
    timestamps: true,
})

const Messages = mongoose.model('Messages', messagesSchema);

module.exports = Messages;

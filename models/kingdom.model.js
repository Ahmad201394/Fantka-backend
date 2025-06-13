const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var kingdomSchema = new Schema({
    kingdomName : { type: String },
    kingdomPicture : { type: String }, 
    kingdomDescription : { type: String }, 
    kingdomType : { type: Number },
    users : [
        {
            user :  {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Broadcaster'
            },
            level: { type: Number } 
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Broadcaster'
    },
    audioBeam : [
        {
            userId :  {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Broadcaster'
            },
            name: { type: String },
            avatar: { type: String },
            liveUid : { type: String },
            level : { type : Number },
            isMuted : { type: Boolean },
        }
    ],
    maxUsers : Number,
    maxAdmins : Number,
    audioChannel : String,
    audioToken : String,
    stats : {
        score : Number
    }

});
 

const Kingdom = mongoose.model('Kingdom', kingdomSchema);

 

module.exports = Kingdom;
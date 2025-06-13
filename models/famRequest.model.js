const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var FamRequestSchema = new Schema({
   
            idFam :  {
                type : mongoose.Schema.Types.ObjectId,
            },
            famName : { type: String },
            user :  {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Broadcaster'
            },
            from :  {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Broadcaster'
            },
            reqType : { type: Number },
            fromAvatar : { type: String },
            fromName : { type: String },
            fromAdmin : { type : Boolean },
            message : { type : String}, 
            status: {type : Number},
            response : { type: String },
        },
        {
            timestamps: true,
        }
   
);
 

const FamRequest = mongoose.model('famRequest', FamRequestSchema);

 

module.exports = FamRequest;
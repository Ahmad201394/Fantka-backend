const router = require('express').Router();

var ObjectId = require('mongoose').Types.ObjectId; 
var randtoken = require('rand-token').generator();

var path = require('path')
let multer = require("multer");

const { getMessageInfos } = require('../utils/utils');

const Storage = multer.diskStorage({
    destination(req, file, callback){
        callback(null, 'public/uploads/messages/' + file.fieldname + 's');
    },
    filename(req, file, callback){
        let pref = '';
        if (file.fieldname == 'image') {  pref = "ph-"; }
        else if (file.fieldname == 'video') {  pref = "vi-"; }
        else if (file.fieldname == 'audio') {  pref = "au-"; }

        callback(null,  pref + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({storage: Storage, limits: {fileSize: 100000000}});

let Chat = require('../models/chat.model');
let ChatMessage = require('../models/messages.model');


router.route('/addMessageFromStream').post((req, res) => {
    const idBroadcasterFrom    = req.body.idBroadcasterFrom;
    const idBroadcasterTo  = req.body.idBroadcasterTo;
    const image        = req.body.image || null;
    const video        = req.body.video || null;
    const audio        = req.body.audio || null;
    const message        = req.body.message || null;
    const gift        = req.body.gift || null;
    const participants = [
        ObjectId(idBroadcasterFrom),
        ObjectId(idBroadcasterTo)
    ]

    var qr = {
        "participants": {
              $all: [
                { $elemMatch: { $eq: ObjectId(idBroadcasterFrom) }},
                { $elemMatch: { $eq: ObjectId(idBroadcasterTo) }}
              ]
      }
    }

    let data = {
        participants : participants
    }

    Chat.findOneAndUpdate(qr, data, { upsert:true, new : true })
    .then(chat => {
        console.log('chat : ', chat);
        let messageItem = new ChatMessage({
            idConversation : chat._id,
            sender : ObjectId(idBroadcasterFrom),
            message,
            image,
            video,
            audio,
            gift
        });
    
        messageItem.save()
        .then(message => res.json(message))
        .catch(err => res.status(400).send((err).toString()));
    })
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/addMessageFromStreamTest').post((req, res) => {
    const idBroadcasterFrom    = req.body.idBroadcasterFrom;
    const idBroadcasterTo  = req.body.idBroadcasterTo;
    const image        = req.body.image || null;
    const video        = req.body.video || null;
    const audio        = req.body.audio || null;
    const message        = req.body.message || null;
    const participants1 = [
        ObjectId(idBroadcasterFrom),
        ObjectId(idBroadcasterTo)
    ]

    var query = { "participants": { $all : participants1}  };

    var qr = {
        "participants": {
              $all: [
                { $elemMatch: { $eq: ObjectId(idBroadcasterFrom) }},
                { $elemMatch: { $eq: ObjectId(idBroadcasterTo) }}
              ]
      }
    }

    let data = {  "participants" : participants1 };

    console.log('paticipant : ', participants1);

    Chat.findOneAndUpdate(qr, data, { upsert:true, new : true } )
    .then(chat => {
        res.json(chat);
       
    })
    .catch(err => res.status(400).send((err).toString()));
});



router.post('/addMessageFromConversation', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), function(req, res, next){


        const image   = (req.files && req.files['image'] != undefined) ? req.files['image'][0].filename : null;
        const video   = ( req.files && req.files['video'] != undefined) ? req.files['video'][0].filename : null;;
        const audio   = (req.files && req.files['audio'] != undefined) ? req.files['audio'][0].filename : null;

        let newMessage = req.body.message;

        if (image != null) { newMessage = 'sended you an image!'}
        else if (video != null) { newMessage = 'sended you a video!'}
        else if (audio != null) { newMessage = 'sended you a vocal!'}

// router.route('/addMessageFromConversation').post((req, res) => {
    const sender    = req.body.sender;
    const idConversation  = req.body.idConversation;
    const message        = req.body.message || null;
    const gift        = req.body.gift || null;

    let messageItem = new ChatMessage({
        idConversation : ObjectId(idConversation),
        sender : ObjectId(sender),
        message,
        image,
        video,
        audio,
        gift
    });

    messageItem.save()
    .then(message => {res.json(message); getMessageInfos(idConversation, sender, newMessage)})
    .catch(err => res.status(400).send((err).toString()));
    
  
});

router.route('/getConversations').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;

    Chat.aggregate([
        {
            $match : {
                participants: { $elemMatch: { $eq: ObjectId(idBroadcaster) } }
            },
        },
        {
            $unwind : "$participants"
        },
        {
            $lookup:
            {
                from: "broadcasters",
                localField: "participants",
                foreignField: "_id",
                as: "broadcasterData"
            }
        },
        {
            $project : {
                broadcasterData : {
                    _id : 1,
                    nickname : 1,
                    picture : 1,
                    level : { $arrayElemAt: [ "$broadcasterData.stats.level", 0 ] }
                },
                idKingdom : 1,
                deleted : 1
            }
        },
        {
            $unwind : {path: "$broadcasterData", preserveNullAndEmptyArrays: true}
        },
        {
            "$group": {
              _id: "$_id",
              "broadcastersData": { "$push": "$broadcasterData"},
              "deletedusers" : {"$push": "$deleted"}
            }
        },
        {
            $lookup:
            {
                from: "messages",
                localField: "_id",
                foreignField: "idConversation",
                as: "messages"
            }
        },
        {
            $unwind : "$messages"
        },
        {
            $match : {
                "messages.hideFrom" : {$ne : ObjectId(idBroadcaster)}
            }
        },
        

        {
            $addFields: {
                isViewed : {
                    $cond : [
                        {
                            $gt : [ 
                                {
                                	 
                                		$cond: { if: { $eq: [ "$messages.sender",ObjectId(idBroadcaster)   ] }, 
                                		then: 1, 
                                		else: {
		                                    $size : {
		                                        $filter: {
		                                            input: "$messages.viewed",
		                                            as: "message",
		                                            cond: { 
		                                                $eq: [ "$$message.idBroadcaster", ObjectId(idBroadcaster) ] 
		                                                                                                 
		                                            }
		                                        }
		                                    }
		                                }
		                            }
                                },
                                0
                            ]
                        },
                        0,
                        1
                    ]
                    
                }
            }
        },
        {
            $sort : {
                "messages.createdAt" : -1
            }
        },
        {
            "$group": {
                _id: {
                    id : "$_id",
                    "broadcastersData": "$broadcastersData",
                    "deletedusers": "$deletedusers"
                },
                "messages": { "$push": "$messages"},
                "unreadMessages" : {$sum : "$isViewed"}
            }
        },
        {
            $project : {
                _id : "$_id.id",
                broadcastersData : "$_id.broadcastersData",
                lastMessage: { $slice: [ "$messages", 1 ] },
                unreadMessages : 1,
                deletedUsers : { $slice: [ "$_id.deletedusers", 1 ] }
            }
        },
        {
            $unwind : {path: "$lastMessage", preserveNullAndEmptyArrays: true}
        },
        {
            $sort : {
                "lastMessage.createdAt" : -1
            }
        },
        { $skip : skip },
        { $limit : limit },
    ])
    .then(conversations => {
        //res.json(conversations)
        let newConv = [];
        conversations.forEach((conv, index) => {
            if (conv.deletedUsers.length == 0 ) { 
                newConv.delTime = 
                newConv.push(conv);
            }
            if (conv.deletedUsers.length > 0 ) {
                let isConv = conv.deletedUsers[0].filter(item => item.userID == idBroadcaster);
                if (isConv.length == 1) {
                    const lastTime = new Date(conv.lastMessage.createdAt);
                    const delTime = new Date(isConv[0].deletedAt);
                    if (delTime < lastTime) {
                        
                        newConv.push(conv);
                    }
                } 
                if (isConv.length == 0) {
                    newConv.push(conv);
                } 
                
            }   
        });
        res.json(newConv)
    
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/getConversation').post((req, res) => {
    const idConversation    = req.body.idConversation;
    const idBroadcaster    = req.body.idBroadcaster;
    const skip    = req.body.skip || 0;
    const limit    = req.body.limit || 10;
    
    Promise.all([
        ChatMessage.aggregate([
            {
                $match : {
                    idConversation: ObjectId(idConversation),
                    hideFrom : {$ne : ObjectId(idBroadcaster)}
                },
            },
            {
                $sort : {
                    createdAt : -1
                }
            },
            { $skip : skip },
            { $limit : limit },
            {
                $sort : {
                    createdAt : 1
                }
            },
        ]),
        ChatMessage.updateMany(
            {idConversation : ObjectId(idConversation), "viewed.idBroadcaster" : {$ne : ObjectId(idBroadcaster) }}, 
            {
                $push : {
                    viewed : {
                        idBroadcaster : ObjectId(idBroadcaster),
                    }
                }
            }
        )
    ])
    .then( ([ conversation, viewdTransaction]) => {res.json(conversation)})
    .catch(err => res.status(400).send((err).toString()));
    
});

router.route('/getUnreadMessagesCount').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;

    Chat.aggregate([
        {
            $match : {
                participants: { $elemMatch: { $eq: ObjectId(idBroadcaster) } }
            },
        },
        {
            $lookup:
            {
                from: "messages",
                localField: "_id",
                foreignField: "idConversation",
                as: "messages"
            }
        },
        {
            $unwind : "$messages"
        },
{
            $addFields: {
                isViewed : {
                    $cond : [
                        {
                            $gt : [ 
                                {
                                	 
                                		$cond: { if: { $eq: [ "$messages.sender",ObjectId(idBroadcaster)   ] }, 
                                		then: 1, 
                                		else: {
		                                    $size : {
		                                        $filter: {
		                                            input: "$messages.viewed",
		                                            as: "message",
		                                            cond: { 
		                                                $eq: [ "$$message.idBroadcaster", ObjectId(idBroadcaster) ] 
		                                                                                                 
		                                            }
		                                        }
		                                    }
		                                }
		                            }
                                },
                                0
                            ]
                        },
                        0,
                        1
                    ]
                    
                }
            }
        },
        {
            $match : {
                isViewed : {$ne : ObjectId(idBroadcaster)}
            }
        },
                {
        "$group": {
            _id : null ,//"$_id",
            "unreadMessages" : {$sum : "$isViewed"}
            }
        },
    ])
    .then(conversations => {
        res.json(conversations)
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/removeSingleMessage').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const idMessage    = req.body.idMessage;

    ChatMessage.findOneAndUpdate({_id : ObjectId(idMessage) }, {$push : {hideFrom : ObjectId(idBroadcaster)}})
    .then(update => res.json(update))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/removeAllMessages').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const idConversation    = req.body.idConversation;

    ChatMessage.updateMany({idConversation : ObjectId(idConversation) }, {$addToSet : {hideFrom : ObjectId(idBroadcaster)}})
    .then(update => res.json(update))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/hasConversation').post((req, res) => {
    const idBroadcasterFrom    = req.body.idBroadcasterFrom;
    const idBroadcasterTo  = req.body.idBroadcasterTo;
    const participants = [
        ObjectId(idBroadcasterFrom),
        ObjectId(idBroadcasterTo)
    ]
    Chat.findOne({ "participants": { "$all" : participants} })
    .then(chat => res.json(chat))
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/deleteConversation').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const idConversation    = req.body.idConversation;

    Chat.findOne({ _id : ObjectId(idConversation)}).
    then(chat => {
        const isExiste = chat.deleted.filter(item => item.userID == idBroadcaster);
        if (isExiste.length > 0) {
            updateDeleteDate(idBroadcaster, idConversation, res);
        }
        if (isExiste.length == 0) {
            addDeleteDate(idBroadcaster, idConversation, res);
        }
    })
    .catch(err => res.status(400).send((err).toString()));

});


const addDeleteDate = (idb, idc, res) =>
{
    Chat.updateOne(
        {_id : ObjectId(idc)}, 
        {
            $push : {
                deleted : {
                    userID : ObjectId(idb),
                    deletedAt : new Date()
                }
            }
        }
    ).
    then(chat => {
        res.json(chat);
    })
    .catch(err => res.status(400).send((err).toString()));
}

const updateDeleteDate = (idb, idc, res) =>
{
    Chat.updateOne(
        {_id : ObjectId(idc)}, 
        {
            $set : {
                deleted : {
                    userID : ObjectId(idb),
                    deletedAt : new Date()
                }
            }
        }
    ).
    then(chat => {
        res.json(chat);
    })
    .catch(err => res.status(400).send((err).toString()));
}



module.exports = router;


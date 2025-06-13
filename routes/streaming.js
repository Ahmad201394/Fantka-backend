const router = require('express').Router();
let LiveStream = require('../models/livestream.model');
let LiveComment = require('../models/livecomment.model');
let GiftTransaction = require('../models/gifttransaction.model');
let Followers = require('../models/followers.model');
let AgencyMembers = require('../models/agencymembers.model');
let multer = require("multer");
var ObjectId = require('mongoose').Types.ObjectId;
const { object } = require('assert-plus');

const { getFans } = require('../utils/utils');


const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'public/uploads');
  },
  filename(req, file, callback) {
    callback(null, `${file.originalname}`);
  }
});

var upload = multer({ storage: Storage, limits: { fileSize: 1000000 } });



// const verifTwice = (idStream, res) => {

//   let toDelete = [];

//   console.log(idStream);
  
//   LiveStream.aggregate([
//     {
//       $match: {
//         _id: ObjectId(idStream)
//       }
//     },
//     { $unwind: "$streamers" },
//     { $group: { _id: "$streamers.idCoBroadcaster", count: { $sum: 1 }, streamers: { $push: "$streamers._id" } } }

//   ]).then(streams => {
//     streams.forEach((elem, index) => {
//       if (elem.count > 1) {
//         toDelete.push(elem.streamers[1]);
//       }
//     })
//     if (toDelete.length > 0) {
//       deleteDouble(toDelete)
//     }
//     else {
//       res.json(streams);
//     }

//   })
//     .catch(err => { res.status(400).send((err).toString()); console.log("verify error") });
// }

const verifTwice = (idStream, res) => {
  
  let toDelete = [];

  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$streamers" },
    { $group: { _id: "$streamers.idCoBroadcaster", count: { $sum: 1 }, streamers: { $push: "$streamers._id" } } },
  ])
    .then(streams => {
      streams.forEach((elem, index) => {
          if (elem.count > 1) {
            toDelete.push(elem.streamers[1]);
          }
      })
        if (toDelete.length > 0) {
          deleteDouble(idStream, toDelete, res)
        }
        else {
          getLiveGuest(idStream, res);
      }
    })
    .catch(err => { res.status(400).send((err).toString()) });
}


const deleteDouble = (idStream, toDelete, res) => {
  LiveStream.updateOne({ _id: ObjectId(idStream) }, { $pull: { streamers: { _id: { $in: toDelete } } } })
    .then(kg => { getLiveGuest(idStream, res); console.log('deleting ', toDelete) })
    .catch(err => {
      res.status(400).send((err).toString());
      console.log('error delete');
    }
    );
};


const getLiveGuest = (idStream, res) => {
  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$streamers" },
    { $match: { "streamers.status": 1 } },
    { $sort: { "streamers.join_at": 1 } },
    { $group: { _id: "$_id", streamers: { $push: "$streamers" } } },
    { $project: { streamers: { $slice: ["$streamers", 100] } } },
  ])
    .then(stream => {
      if (stream.length > 0) res.json(stream[0])
      else res.json(null)
    })
    .catch(err => { res.status(400).send((err).toString()) });
}


router.route('/getTwice').post((req, res) => {
  const idStream = (req.body.idStream).trim();
  verifTwice(idStream, res)
});

router.route('/getFollowedsStreams').post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  Followers.aggregate([
    {
      $match: {
        $or: [{ idFollower: ObjectId(idBroadcaster) }]
      },
    },
    {
      $lookup:
      {
        from: "livestreams",
        localField: "idFollowed",
        foreignField: "idBroadcaster",
        as: "live"
      }
    },
    {
      $project: {
        live: 1,
      }
    },
    { $unwind: "$live" },
    { $replaceRoot: { newRoot: "$live" } },
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    { $skip: skip },
    { $limit: limit }
  ])
    .then(streams => {
      console.log("done");
      res.json(streams);
    })
    .catch(err => { res.status(400).send((err).toString()) });
});



router.route('/getAgencyStreams').post((req, res) => {

  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  AgencyMembers.aggregate([
    {
      $lookup:
      {
        from: "livestreams",
        localField: "idBroadcaster",
        foreignField: "idBroadcaster",
        as: "live"
      }
    },
    {
      $project: {
        live: 1,
      }
    },
    { $unwind: "$live" },
    { $replaceRoot: { newRoot: "$live" } },
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    { $skip: skip },
    { $limit: limit }
  ])
    .then(streams => {
      console.log("done");
      res.json(streams);
    })
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/new').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  var globalQuery = [
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    {
      $sort: {
        "createdAt": -1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/friendList').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  var globalQuery = [
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    {
      $match: {
        multibeamLayout: 1
      }
    },
    {
      $sort: {
        "createdAt": -1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/featured').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  var globalQuery = [
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    {
      $sort: {
        "stats.diamonds": -1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/byCountryCode').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;
  const byCountryCode = req.body.byCountryCode || false;


  var globalQuery = [
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          // countryCode: 0,
          settings: 0
        }
      }
    },
    {
      $match: {
        "broadcasterData.countryCode": byCountryCode
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/getMultiBeam').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;
  var globalQuery = [
    {
      $match: { status: 1 }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    {
      $match: {
        multibeamLayout: { $gt: 1 }
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/isInBattle').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  var globalQuery = [
    {
      $match: { status: 1, isInBattle: { $ne: null } }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/createStream').post((req, res) => {
  var timeZoneConfig = new Date();
  timeZoneConfig.toLocaleString('en-US', { timeZone: 'America/New_York' });

  const agoraStreamId = req.body.agoraUid;
  const agoraChannelId = req.body.agoraChannelId;
  const agoraToken = req.body.agoraToken;
  const idBroadcaster = req.body.broadCasterId;
  const aboutStream = req.body.aboutStream;
  const picture = req.body.picture;
  const streamType = req.body.streamType || "V";
  const category = req.body.category;
  const multibeamLayout = req.body.multiBeamLayout || 1;
  const isVideo = req.body.isVideo;
  const isMute = req.body.isMute;
  const isMirror = req.body.isMirror;
  const decorRoom = req.body.decorRoom || "";

  const streamPosition = {
    lat: req.body.lat,
    lon: req.body.lon,
  };

  const status = 1;
  const startAt = Date.parse(new Date());
  const endAt = Date.parse(new Date());
  const newStream = new LiveStream({
    agoraStreamId,
    agoraChannelId,
    agoraToken,
    idBroadcaster,
    aboutStream,
    picture,
    streamType,
    category,
    multibeamLayout,
    stats: {
      coins: 0,
      diamonds: 0,
      fans: 0,
      stars: 0,
    },
    streamControl: {
      isVideo: isVideo,
      isMute: isMute,
      isMirror: isMirror
    },
    options : { decorRoom : decorRoom},
    streamPosition,
    status,
    startAt,
    endAt
  });

  newStream.save({ offset: timeZoneConfig.getTimezoneOffset() })
    .then(stream => {getFans(stream._id, idBroadcaster, stream.picture, 1); res.json(stream)})
    .catch(err => { res.status(400).send((err).toString()) });

});


router.route('/leaveStream').post((req, res) => {
  const idBroadcaster = req.body.broadCasterId;
  const idStream = req.body.streamId;
  const endAt = Date.parse(new Date());

  LiveStream.updateOne(
    { _id: ObjectId(idStream), idBroadcaster: ObjectId(idBroadcaster) },
    {
      $set:
      {
        status: 0,
        endAt: endAt
      }
    }
  )
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });

});

// router.route('/leaveStream').post((req, res) => {
//   const idBroadcaster   = req.body.broadCasterId;
//   const idStream   = req.body.streamId;
//   const endAt = Date.parse(new Date());
//   Promise.all([
//     LiveStream.updateOne(
//       {_id: ObjectId(idStream), idBroadcaster: ObjectId(idBroadcaster) },  
//       { $set: 
//         {
//           status: 0,
//           endAt : endAt
//         }
//       }
//     ),
//     BattleSession.updateOne({"battleStreams.idLive" : ObjectId(idStream)},{$set : {status : 0}})
//   ]).then( ([ killLive, killBattle ]) => {
//     res.json({killLive, killBattle})
//   }).catch(err => res.status(400).send((err).toString()));

// });


router.route('/updateStreamer').post((req, res) => {
  const idBroadcaster = req.body.broadCasterId;
  const idStream = req.body.streamId;
  const endAt = Date.parse(new Date());

  LiveStream.updateOne(
    { _id: ObjectId(idStream), idBroadcaster: ObjectId(idBroadcaster) },
    {
      $set:
      {
        status: 0,
        endAt: endAt
      }
    }
  )
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });

});

router.route('/leaveAudiance').post((req, res) => {
  const idAudiance = req.body.audianceId;
  const idStream = req.body.streamId;
  const left_at = Date.parse(new Date());

  LiveStream.updateOne({ _id: ObjectId(idStream), audiance: { $elemMatch: { idAudiance: ObjectId(idAudiance) } } },
    {
      $set:
      {
        "audiance.$.status": 0,
        "audiance.$.left_at": left_at
      }
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/getStreamInfo').post((req, res) => {
  const idStream = req.body.streamId;
  LiveStream.findOne({ _id: ObjectId(idStream) })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/getAudiances').post((req, res) => {
  const idStream = req.body.streamId;

  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$audiance" },
    { $match: { "audiance.status": 1 } },
    { $sort: { "audiance.sendedDiamond": -1 } },
    { $group: { _id: "$_id", audiance: { $push: "$audiance" } } },
    { $project: { audiance: { $slice: ["$audiance", 100] } } }
  ])
    .then(stream => res.json(stream))
    .catch(err => {
      res.status(400).send((err).toString())
    });
});


router.route('/getGuestStreamers').post((req, res) => {
  const idStream = req.body.streamId;
  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$streamers" },
    { $match: { "streamers.status": 1 } },
    { $sort: { "streamers.join_at": 1 } },
    { $group: { _id: "$_id", streamers: { $push: "$streamers" } } },
    { $project: { streamers: { $slice: ["$streamers", 100] } } },
  ])
    .then(stream => {
      if (stream.length > 0) res.json(stream[0])
      else res.json(null)
    })
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/getGuestGifters').post((req, res) => {
  const idStream = req.body.streamId;
  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$gifters" },
    { $sort: { "gifters.giftValue": -1 } },
    { $group: { _id: "$_id", gifters: { $push: "$gifters" } } },
    { $project: { gifters: { $slice: ["$gifters", 1000] } } },
  ])
    .then(gifters => {
      if (gifters.length > 0) res.json(gifters[0])
      else res.json(null)
    })
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/getGuestGiftersList').post((req, res) => {
  const idStream = req.body.idStream;
  const idReciver = req.body.idReciver;
  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream),
      }
    },
    { $unwind: "$gifters" },
    { $match: { "gifters.reciverId": ObjectId(idReciver), } },
    { $sort: { "gifters.giftValue": -1 } },
    { $group: { _id: "$_id", gifters: { $push: "$gifters" } } },
    { $project: { gifters: { $slice: ["$gifters", 1000] } } },
  ])
    .then(gifters => {
      if (gifters.length > 0) res.json(gifters[0])
      else res.json(null)
    })
    .catch(err => { res.status(400).send((err).toString()) });
});



router.route('/setStreamControl').post((req, res) => {
  const idStream = req.body.streamId;
  const isVideo = req.body.isVideo;
  const isMute = req.body.isMute;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    {
      $set:
        { "streamControl.isVideo": isVideo, "streamControl.isMute": isMute }
    })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
});

router.route('/setStreamControlAudio').post((req, res) => {
  const idStream = req.body.streamId;
  const isVideo = req.body.isVideo;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    {
      $set:
        { "streamControl.isVideo": isVideo }
    })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
});


router.route('/setStreamControlMute').post((req, res) => {
  const idStream = req.body.streamId;
  const isMute = req.body.isMute;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    {
      $set:
        { "streamControl.isMute": isMute }
    })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
});

router.route('/setStreamControlMirror').post((req, res) => {
  const idStream = req.body.streamId;
  const isMirror = req.body.isMirror;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    {
      $set:
        { "streamControl.isMirror": isMirror }
    })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
});




router.route('/setGuestStreamControlVideo').post((req, res) => {
  const idStream = req.body.streamId;
  const isVideo = req.body.isVideo;
  const idStreamer = req.body.idStreamer;


  LiveStream.updateOne({ _id: ObjectId(idStream), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(idStreamer) } } },
    {
      $set:
      {
        "streamers.$.isVideo": isVideo,
      }
    })
    .then(streamer => { res.json(streamer); console.log(streamer) })
    .catch(err => res.status(400).json('Error: ', err));
});

router.route('/setGuestStreamControlMute').post((req, res) => {
  const idStream = req.body.streamId;
  const isMute = req.body.isMute;
  const idStreamer = req.body.idStreamer;

  LiveStream.updateOne({ _id: ObjectId(idStream), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(idStreamer) } } },
    {
      $set:
      {
        "streamers.$.isMute": isMute,
      }
    })
    .then(streamer => { res.json(streamer); console.log(streamer) })
    .catch(err => res.status(400).json('Error: ', err));
});

router.route('/setGuestStreamControlMirror').post((req, res) => {
  const idStream = req.body.streamId;
  const isMirror = req.body.isMirror;
  const idStreamer = req.body.idStreamer;

  LiveStream.updateOne({ _id: ObjectId(idStream), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(idStreamer) } } },
    {
      $set:
      {
        "streamers.$.isMirror": isMirror,
      }
    })
    .then(streamer => { res.json(streamer); console.log(streamer) })
    .catch(err => res.status(400).json('Error: ', err));

});


router.route('/setGuestStreamDiamonds').post((req, res) => {
  const idStream = req.body.streamId;
  const idStreamer = req.body.idStreamer;
  const diamonds = req.body.diamonds;

  LiveStream.updateOne({ _id: ObjectId(idStream), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(idStreamer) } } },
    { $inc: { "streamers.$.diamonds": diamonds } })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
});


router.route('/setGuestStreamDiamondsStats').post((req, res) => {
  const idStream = req.body.streamId;
  const diamonds = req.body.diamonds;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    { $inc: { "stats.diamonds": diamonds } })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
    
});


router.route('/updateBeamLayout').post((req, res) => {
  const idStream = req.body.streamId;
  const multibeamLayout = req.body.multibeamLayout;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    { $set: { "multibeamLayout": multibeamLayout } })
    .then(streame => res.json(streame))
    .catch(err => res.status(400).json('Error: ', err));
});

router.route('/setGuestStreamFansStats').post((req, res) => {
  const idStream = req.body.streamId;

  LiveStream.updateOne({ _id: ObjectId(idStream) },
    { $inc: { "stats.fans": 1 } })
    .then(streamer => res.json(streamer))
    .catch(err => res.status(400).json('Error: ', err));
});





router.post('/upload-image', upload.single('image'), function (req, res, next) {
  res.json(true);
});



router.route('/addGuestStream').post((req, res) => {
  const streamID = req.body.streamId;
  const audianceId = req.body.audianceId;
  const liveUid = req.body.liveUid;
  const picture = req.body.picture;
  const nickname = req.body.nickname;
  const diamonds = req.body.diamonds;
  const isVideo = req.body.isVideo;
  const isMute = req.body.isMute;
  var streamer = {
    idCoBroadcaster: audianceId,
    liveUid: liveUid,
    picture: picture,
    nickname: nickname,
    diamonds: diamonds,
    join_at: Date.parse(new Date()),
    status: 1,
    isVideo: isVideo,
    isMute: isMute
  };

  LiveStream.findOne({ _id: ObjectId(streamID), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(audianceId) } } })
    .then(stream => {
      if (!stream)
        LiveStream.updateOne({ _id: ObjectId(streamID) }, { $push: { streamers: streamer } })
          .then(stream => res.json(stream))
          .catch(err => { res.status(400).send((err).toString()) });
      else

        LiveStream.updateOne({ _id: ObjectId(streamID), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(audianceId) } } }, {
          $set: {
            "streamers.$.diamonds": 0,
            "streamers.$.status": 1,
            "streamers.$.liveUid": liveUid,
            "streamers.$.join_at": Date.parse(new Date()),
            "streamers.$.isVideo": stream.streamType == "A" ? false : true,
            "streamers.$.isMute": false,
          }
        })
          .then(stream => { 
            
            verifTwice(streamID, res);
            //setTimeout(() => { verifTwice(streamID, res) }, 1000);
            //res.json(stream);
          })
          .catch(err => { res.status(400).send((err).toString()) });
    }
    )
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/deleteGifters').post((req, res) => {

  const streamID = req.body.streamId;
  const audianceId = req.body.audianceId;
  LiveStream.updateOne( { _id: ObjectId(streamID) }, { $pull: { gifters: { reciverId: ObjectId(audianceId) } } } )
    .then(kg => {res.json(kg);})
    .catch(err => res.status(400).send((err).toString()));

});



router.route('/leftGuestStream-old').post((req, res) => {
  const idCoBroadcaster = req.body.idCoBroadcaster;
  const idStream = req.body.streamId;
  const left_at = Date.parse(new Date());
  LiveStream.updateOne({ _id: ObjectId(idStream), "streamers.idCoBroadcaster": ObjectId(idCoBroadcaster) },
    {
      $set:
      {
        "streamers.$.status": 0,
        "streamers.$.left_at": left_at
      }
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/leftGuestStream').post((req, res) => {
  const idCoBroadcaster = req.body.idCoBroadcaster;
  const idStream = req.body.streamId;
  const left_at = Date.parse(new Date());
  LiveStream.updateOne({ _id: ObjectId(idStream), streamers: { $elemMatch: { idCoBroadcaster: ObjectId(idCoBroadcaster) } } },
    {
      $set:
      {
        "streamers.$.status": 0,
        "streamers.$.left_at": left_at
      }
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/addComment').post((req, res) => {
  const streamID = req.body.streamId;
  const audienceId = req.body.audienceId;
  const message = req.body.message;
  const liveComment = new LiveComment({
    idLiveStream: streamID,
    idAudience: audienceId,
    message,
  });
  liveComment.save()
    .then(comment => { () => res.json(comment) })
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/addAudiance').post((req, res) => {
  const streamID = req.body.streamId;
  const audianceId = req.body.audianceId;
  const liveUid = req.body.liveUid;
  const picture = req.body.picture;
  const nickname = req.body.nickname;
  const sendedDiamond = req.body.sendedDiamond || 0;
  const guardian = req.body.guardian || 0;

  var audianceData = {
    idAudiance: audianceId,
    liveUid: liveUid,
    picture: picture,
    sendedDiamond,
    guardian,
    nickname,
    join_at: Date.parse(new Date()),
    status: 1
  };

  LiveStream.findOne({ _id: ObjectId(streamID), audiance: { $elemMatch: { idAudiance: ObjectId(audianceId) } } })
    .then(audiance => {
      if (!audiance)
        LiveStream.updateOne({ _id: ObjectId(streamID) }, { $push: { audiance: audianceData } })
          .then(audiance => res.json(audiance))
          .catch(err => { res.status(400).send((err).toString()) });
      else
        LiveStream.updateOne({ _id: ObjectId(streamID), audiance: { $elemMatch: { idAudiance: ObjectId(audianceId) } } }, { $set: { "audiance.$.status": 1 } })
          .then(audiance => res.json(audiance))
          .catch(err => { res.status(400).send((err).toString()) });
    }
    )
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/updateAudianceStats').post((req, res) => {
  const idStream = req.body.streamId;
  const diamonds = req.body.diamonds;
  const idAudiance = req.body.idAudiance;

  LiveStream.updateOne({ _id: ObjectId(idStream), audiance: { $elemMatch: { idAudiance: ObjectId(idAudiance) } } },
    {
      $inc:
      {
        "audiance.$.sendedDiamond": diamonds
      }
    })
    .then(audiances => res.json(audiances))
    .catch(err => res.status(400).json('Error: ', err));
});

router.route('/leftGuestStreamByUid').post((req, res) => {
  const uid = req.body.uid;
  const idStream = req.body.streamId;
  const left_at = Date.parse(new Date());
  LiveStream.updateOne({ _id: ObjectId(idStream), streamers: { $elemMatch: { liveUid: uid } } },
    {
      $set:
      {
        "streamers.$.status": 0,
        "streamers.$.left_at": left_at
      }
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
});


router.route('/getReplay').post((req, res) => {
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;
  const idBroadcaster = req.body.idBroadcaster;

  var globalQuery = [
    {
      $match: { status: 0, idBroadcaster: ObjectId(idBroadcaster), isVisible: true }
    },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "broadcasterData"
      },
    },
    {
      $unwind: "$broadcasterData"
    },
    {
      $project: {
        broadcasterData: {
          "_id": 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          stats: 0,
          signupPosition: 0,
          password: 0,
          status: 0,
          fbID: 0,
          pictures: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          country: 0,
          countryCode: 0,
          settings: 0
        }
      }
    },
    {
      $sort: {
        "createdAt": -1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  LiveStream.aggregate(globalQuery)
    .then(streams => res.json(streams))
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/removeReplay').post((req, res) => {
  const idLive = req.body.idLive;

  LiveStream.updateOne({ _id: ObjectId(idLive) },
    {
      $set:
      {
        isVisible: false
      }
    })
    .then(replay => res.json(replay))
    .catch(err => res.status(400).json('Error: ', err));
});



router.route('/isInLive').post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;

  LiveStream.find({ idBroadcaster: ObjectId(idBroadcaster), status: 1 })
    .then(streams => {
      res.json(streams)
    })
    .catch(err => { res.status(400).send((err).toString()) });
});

router.route('/getAudianceList').post((req, res) => {
  const idStream = req.body.idStream;
  const idBroadcaster = req.body.idBroadcaster;
  const followerId = [ObjectId(idBroadcaster)];
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$audiance" },
    { $group: { _id: "$_id", audiance: { $push: "$audiance" } } },
    { $unwind: "$audiance" },
    {
      $match: {
        "audiance.status": 1
      }
    },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "audiance.idAudiance",
        foreignField: "_id",
        as: "broadcasterData"
      }
    },
    { $unwind: "$broadcasterData" },
    {
      $lookup:
      {
        from: "followers",
        localField: "audiance.idAudiance",
        foreignField: "idFollowed",
        as: "followers"
      }
    },
    {
      $addFields: {
        "isFollower": {
          $cond: [
            {
              $gt: [
                {
                  $size:
                    { "$ifNull": [{ $setIntersection: ["$followers.idFollower", followerId] }, []] }

                }
                , 0
              ]
            },
            true,
            false
          ]
        },
      }
    },
    {
      $project: {
        "idAudiance": "$broadcasterData._id",
        "picture": "$audiance.picture",
        "nickname": "$audiance.nickname",
        "isFollower": "$isFollower",
        "level": "$broadcasterData.stats.level"
      },
    },

  ])
    .then(stream => res.json(stream))
    .catch(err => {
      res.status(400).send((err).toString())
    });
});


router.route('/getGiftersList').post((req, res) => {
  const idStream = req.body.idStream;
  const idBroadcaster = req.body.idBroadcaster;
  const followerId = [ObjectId(idBroadcaster)];
  const skip = req.body.skip || 0;
  const limit = req.body.limit || 10;

  LiveStream.aggregate([
    {
      $match: {
        _id: ObjectId(idStream)
      }
    },
    { $unwind: "$gifters" },
    { $group: { _id: "$_id", gifters: { $push: "$gifters" } } },
    { $unwind: "$gifters" },
    {
      $match: {
        "gifters.reciverId": idBroadcaster
      }
    },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup:
      {
        from: "broadcasters",
        localField: "gifters.gifterId",
        foreignField: "_id",
        as: "broadcasterData"
      }
    },
    { $unwind: "$broadcasterData" },
    {
      $lookup:
      {
        from: "followers",
        localField: "gifters.gifterId",
        foreignField: "idFollowed",
        as: "followers"
      }
    },
    {
      $addFields: {
        "isFollower": {
          $cond: [
            {
              $gt: [
                {
                  $size:
                    { "$ifNull": [{ $setIntersection: ["$followers.idFollower", followerId] }, []] }

                }
                , 0
              ]
            },
            true,
            false
          ]
        },
      }
    },
    {
      $project: {
        "idAudiance": "$broadcasterData._id",
        "picture": "$gifters.gifterAvatar",
        "nickname": "$broadcasterData.nickname",
        "isFollower": "$isFollower",
        "value": "$gifters.giftValue",
      },
    },

  ])
    .then(stream => res.json(stream))
    .catch(err => {
      res.status(400).send((err).toString())
    });
});


router.route('/updateStreamName').post((req, res) => {
  const about = req.body.about;
  const idStream = req.body.idStream;
  LiveStream.updateOne({ _id: ObjectId(idStream) },
    {
      $set:
      {
        "aboutStream": about,
      }
    })
    .then(stream => res.json(stream))
    .catch(err => { res.status(400).send((err).toString()) });
});




module.exports = router;
let Followers = require("../models/followers.model");
let Broadcaster = require("../models/brodcaster.model");
let LiveStream = require("../models/livestream.model");
let Chat = require("../models/chat.model");

var ObjectId = require("mongoose").Types.ObjectId;

// var fcm = require('fcm-notification');
// var FCM = new fcm("./constants/privatekey.json");

const getMessageInfos = (idConversation, idSender, message) => {
  Chat.findOne({ _id: ObjectId(idConversation) })
    .then((ch) => {
      let participants = ch.participants;
      let reci = participants.filter((item) => item != idSender);
      let reciver = reci[0];
      Promise.all([
        Broadcaster.findOne({ _id: ObjectId(idSender) }),
        Broadcaster.findOne({ _id: ObjectId(reciver) }),
      ])
        .then(([res1, res2]) => {
          let info = {
            senderName: res1.nickname,
            senderAvatar: res1.picture,
            reciverToken: res2.pushToken,
            message: message,
          };
          sendPushNotifSingle(info);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const getBroadcasterInfos = (idLive, idBroadcaster, livePict, tokens, type) => {
  Broadcaster.findOne({ _id: ObjectId(idBroadcaster) })
    .then((brd) => {
      sendPushNotif(
        idLive,
        idBroadcaster,
        livePict,
        tokens,
        type,
        brd.nickname
      );
    })
    .catch((err) => console.log(err));
};

const getFans = (idLive, idBroadcaster, livePict, type) => {
  var idFollowed = idBroadcaster;
  var globalQuery = [
    {
      $match: {
        idFollowed: ObjectId(idFollowed),
      },
    },
    {
      $lookup: {
        from: "broadcasters",
        localField: "idFollower",
        foreignField: "_id",
        as: "followerData",
      },
    },
    {
      $unwind: { path: "$followerData", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        followerData: {
          _id: 0,
          idDealer: 0,
          idBroadcaster: 0,
          biography: 0,
          phone: 0,
          localphone: 0,
          email: 0,
          sex: 0,
          birthday: 0,
          // stats: 0,
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
          settings: 0,
        },
        otherFollowers: 0,
      },
    },
  ];

  Followers.aggregate(globalQuery)
    .then((fans) => {
      let tok = [];
      fans.forEach((el) => {
        if (el.followerData.pushToken) {
          if (
            el.followerData.pushToken != "" ||
            el.followerData.pushToken != null
          ) {
            tok.push(el.followerData.pushToken);
          }
        }
      });
      getBroadcasterInfos(idLive, idBroadcaster, livePict, tok, type);
    })
    .catch((err) => console.log(err));
};

const sendPushNotif = (
  idLive,
  idBroadcaster,
  livePict,
  tokens,
  type,
  nickname,
  result
) => {
  var Tokens = tokens;

  let message = "i'm waiting for you ...";
  let title = nickname + " is Live now!";
  let notifPict = "https://fantkapp.fantkalive.com/static/uploads/" + livePict;
  let link = "fantka://live/" + idLive;

  var callbackLog = function (sender, err, res) {
    //result.send({sended: 'ok'})
    console.log("\n__________________________________");
    console.log("\t" + sender);
    console.log("----------------------------------");
    console.log("err=" + err);
    console.log("res=" + res);
    console.log("----------------------------------\n>>>");
  };

  var sendedMessage = {
    data: {
      url: link,
    },
    notification: {
      title: title,
      body: message,
      image: notifPict,
    },
    webpush: {
      fcmOptions: {
        link: link,
      },
    },
  };

  // FCM.sendToMultipleToken(sendedMessage, Tokens, function(err,res){
  //     callbackLog('sendOK',err,res);
  // });
};

const sendPushNotifSingle = (info) => {
  var token = info.reciverToken;

  var message = {
    data: {
      //This is only optional, you can send any data
      score: "850",
      time: "2:45",
    },
    notification: {
      title: "New message",
      body: info.senderName + " : " + info.message,
      image:
        "https://fantkapp.fantkalive.com/static/uploads/avatars/" +
        info.senderAvatar,
    },
    android: {
      ttl: 3600 * 1000,
      notification: {
        color: "#AB0570",
        icon:
          "https://fantkapp.fantkalive.com/static/uploads/avatars/" +
          info.senderAvatar,
      },
    },
    token: token,
  };

  FCM.send(message, function (err, response) {
    if (err) {
      console.log("error found", err);
    } else {
      console.log("response here", response);
    }
  });
};

module.exports = { getFans, getMessageInfos };

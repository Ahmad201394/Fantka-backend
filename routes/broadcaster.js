const router = require("express").Router();

const bcrypt = require("bcrypt");
var randtoken = require("rand-token").generator();
var path = require("path");
let multer = require("multer");
var ObjectId = require("mongoose").Types.ObjectId;
const JWT = require("jsonwebtoken");

const fs = require("fs");
const client = require("https");

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/uploads/avatars/");
  },
  filename(req, file, callback) {
    callback(null, "avt-" + Date.now() + path.extname(file.originalname));
  },
});

var upload = multer({ storage: Storage, limits: { fileSize: 1000000 } });
const saltRounds = 10;

let Broadcaster = require("../models/brodcaster.model");
let Level = require("../models/levels.model");
let GoldenNumber = require("../models/goldennumbers.model");
let GoldenNumberHistory = require("../models/goldenNumberHistory.model");

const UserSession = require("../models/userSession.model");

const { object } = require("assert-plus");
/*
 * @accept : 
    brodid :
 * @return : 
 */

router.route("/").post((req, res) => {
  var pageOptions = {
    page: parseInt(req.body.page, 10) || 0,
    limit: parseInt(req.body.limit, 10) || 10,
  };
  var query = req.body.query;

  Broadcaster.find({
    $or: [
      { idBroadcaster: { $regex: ".*" + query + ".*" } },
      { nickname: { $regex: ".*" + query + ".*", $options: "i" } },
    ],
  })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .exec(function (err, doc) {
      if (err) {
        res.status(500).json(err);
        return;
      }
      res.status(200).json(doc);
    });
});
//     .then(streams => res.json(streams))
//       .catch(err => res.status(400).json('Error: ', err));
// });

router.route("/add").post((req, res) => {
  var idBroadcaster = randtoken.generate(9, "0123456789");

  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newBroadcaster = new Broadcaster({
      idDealer: req.body.idDealer || null,
      idBroadcaster: idBroadcaster,
      nickname: req.body.nickname,
      biography: req.body.biography || "",
      phone: req.body.phone,
      localphone: req.body.localphone,
      email: req.body.email || "",
      sex: req.body.sex,
      birthday: Date.parse(req.body.birthday),
      picture: req.body.picture || "",
      country: req.body.country,
      countryCode: req.body.countryCode,
      stats: {
        liveStreams: 0,
        coins: 0,
        diamonds: 0,
        realdiamonds: 0,
        following: 0,
        fans: 0,
        level: 1,
        stars: 0,
        exps: 0,
        expsMin: 0,
        expsMax: 1000,
      },
      signupPosition: {
        lat: req.body.lat,
        lon: req.body.lon,
      },
      settings: {
        country: req.body.country,
        countryCode: req.body.countryCode,
        lang: "EN",
        isLocation: false,
        isInterest: false,
        isBirthDay: false,
        isZodiac: false,
      },
      password: hash,
      status: req.body.status || 1,
      fbID: req.body.fbId,
      googleID: req.body.googleID,
      twID: req.body.twId,
      appleID: req.body.appleID || "",
      pushToken: "",
    });

    

    newBroadcaster
      .save()
      .then((broadcaster) => {
        const id = broadcaster._id;
        const token = JWT.sign({ id }, process.env.JWTSECRET, {});
        const r = {
          isLogin: true,
          idBroadcaster: broadcaster._id,
          nickname: broadcaster.nickname,
          codeBroadcaster: broadcaster.idBroadcaster,
          picture: broadcaster.picture,
          token: token,
          userInfo: broadcaster,
        };
        res.json(r);
      })
      .catch((err) => res.status(400).send(err.toString()));
  });
});

router.route("/searchBroadcaster").post((req, res) => {
  var currentBroadcaster = req.body.broadcaster;
  var searchInput = req.body.searchInput;
  var skip = req.body.skip;
  var limit = req.body.limit;
  Broadcaster.aggregate([
    {
      $match: {
        $or: [
          { idBroadcaster: { $regex: ".*" + searchInput + ".*" } },
          { nickname: { $regex: ".*" + searchInput + ".*", $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "idFollowed",
        as: "followers",
      },
    },
    {
      $addFields: {
        isFollower: {
          $cond: [
            {
              $gt: [
                {
                  $size: {
                    $ifNull: [
                      {
                        $setIntersection: [
                          "$followers.idFollower",
                          [ObjectId(currentBroadcaster)],
                        ],
                      },
                      [],
                    ],
                  },
                },
                0,
              ],
            },
            true,
            false,
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        idBroadcaster: 1,
        nickname: 1,
        isFollower: 1,
        picture: 1,
        "stats.level": 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ])
    .then((broadcasters) => {
      res.json(broadcasters);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res
          .pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
}

router.post(
  "/addBroadPicture",
  upload.single("image"),
  function (req, res, next) {
    var idBroadcaster = req.body.idBroadcaster;
    var isAvatar = req.body.isAvatar;

    let data = {
      $push: {
        pictures: { picture: req.file.filename },
      },
    };
    if (isAvatar == 1) data.picture = req.file.filename;
    Broadcaster.updateOne({ _id: ObjectId(idBroadcaster) }, data)
      .then((broadcaster) => {
        res.json(broadcaster);
      })
      .catch((err) => res.status(400).send(err.toString()));
  }
);

router.route("/downloadSocialPicture").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  avatar = req.body.avatar;
  accessBy = req.body.accessBy;

  var ext = accessBy == "fb" ? "jpg" : "png";

  var path = "public/uploads/avatars/";
  //var ext1 = avatar.split('.');
  //var ext = ext1[ext1.length - 1];
  var fl = "avt-" + Date.now() + "." + ext;
  var finalPath = path + fl;

  downloadImage(avatar, finalPath).then(console.log).catch(console.error);

  let data = {
    picture: fl,
    $push: {
      pictures: { picture: fl },
    },
  };
  Broadcaster.updateOne({ _id: ObjectId(idBroadcaster) }, data)
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/setInitialPicture").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var avatar = req.body.avatar;
  let data = {
    picture: avatar,
  };
  Broadcaster.updateOne({ _id: idBroadcaster }, data)
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/deletePicture").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var avatar = req.body.avatar;
  Broadcaster.updateOne(
    { _id: ObjectId(idBroadcaster) },
    { $pull: { pictures: { picture: avatar } } }
  )
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/updateBroadInfo").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var nickname = req.body.nickname;
  var sex = req.body.sex;
  var biography = req.body.biography;
  var birthday = Date.parse(req.body.birthday);
  Broadcaster.updateOne(
    { _id: ObjectId(idBroadcaster) },
    {
      $set: {
        nickname,
        sex,
        biography,
        birthday,
      },
    }
  )
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/updateBroadSettings").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var isLocation = req.body.isLocation;
  var isInterest = req.body.isInterest;
  var isBirthday = req.body.isBirthday;
  var isZodiac = req.body.isZodiac;
  Broadcaster.updateOne(
    { _id: ObjectId(idBroadcaster) },
    {
      $set: {
        "settings.isLocation": isLocation,
        "settings.isInterest": isInterest,
        "settings.isBirthDay": isBirthday,
        "settings.isZodiac": isZodiac,
      },
    }
  )
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/updateBroadcasterToken").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var token = req.body.token;
  let data = {
    pushToken: token,
  };
  Broadcaster.updateOne({ _id: ObjectId(idBroadcaster) }, data)
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/login").post((req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;
  Broadcaster.findOne(
    {
      $or: [
        { email: user },
        { phone: user.replace("+", "") },
        { localphone: user.replace("+", "") },
      ],
    },
    {}
  )
    .then((broadcaster) => {
      if (broadcaster) {
        bcrypt.compare(pass, broadcaster.password, (error, response) => {
          if (response) {
            const id = broadcaster._id;
            const token = JWT.sign({ id }, process.env.JWTSECRET, {});
            const r = {
              isLogin: true,
              idBroadcaster: broadcaster._id,
              nickname: broadcaster.nickname,
              codeBroadcaster: broadcaster.idBroadcaster,
              picture: broadcaster.picture,
              token: token,
              userInfo: broadcaster,
            };
            res.json(r);
          } else {
            res.json({
              isLogin: false,
              message: "Wrong username/password combination!",
            });
          }
        });
      } else {
        res.json({
          isLogin: false,
          message: "Wrong username/password combination!",
        });
      }
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/getBroadcasterData").post((req, res) => {
  const idBroadcaster = req.body.boadcasterId;
  Broadcaster.findOne({ _id: ObjectId(idBroadcaster) }, { password: 0 })
    .then((broadcaster) => {
      res.json({ broadcaster });
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/isPhoneExist").post((req, res) => {
  const user = req.body.user;
  Broadcaster.findOne({ phone: user }, {})
    .then((broadcaster) => {
      if (broadcaster) {
        res.json({ error: true, message: "User already exists!" });
      } else {
        res.json({ error: false });
      }
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/isFbExist").post((req, res) => {
  const user = req.body.user;
  const dID = req.body.deviceId;

  let output = {};
  let dataSession = {};

  Broadcaster.findOne({ fbID: user }, {})
    .then((broadcaster) => {
      if (broadcaster) {
        const id = broadcaster._id;
        const token = JWT.sign({ id }, process.env.JWTSECRET, {});
        output = {
          isLogin: true,
          idBroadcaster: broadcaster._id,
          nickname: broadcaster.nickname,
          codeBroadcaster: broadcaster.idBroadcaster,
          picture: broadcaster.picture,
          token: token,
          userInfo: broadcaster,
        };
        dataSession = { deviceId: dID, token: token };

        UserSession.findOneAndUpdate(
          {
            idBroadcaster: ObjectId(broadcaster._id),
          },
          {
            $set: dataSession,
          },
          { upsert: true }
        )
          .then((sess) => res.json(output))
          .catch((err) => {
            res.status(400).send(err.toString());
          });
      } else {
        res.json({ isLogin: false });
      }
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/isGoogleExist").post((req, res) => {
  const user = req.body.user;
  const dID = req.body.deviceId;

  let output = {};
  let dataSession = {};

  Broadcaster.findOne({ googleID: user }, {})
    .then((broadcaster) => {
      if (broadcaster) {
        const id = broadcaster._id;
        const token = JWT.sign({ id }, process.env.JWTSECRET, {});
        output = {
          isLogin: true,
          idBroadcaster: broadcaster._id,
          nickname: broadcaster.nickname,
          codeBroadcaster: broadcaster.idBroadcaster,
          picture: broadcaster.picture,
          token: token,
          userInfo: broadcaster,
        };
        dataSession = { deviceId: dID, token: token };

        UserSession.findOneAndUpdate(
          {
            idBroadcaster: ObjectId(broadcaster._id),
          },
          {
            $set: dataSession,
          },
          { upsert: true }
        )
          .then((sess) => res.json(output))
          .catch((err) => {
            res.status(400).send(err.toString());
          });
      } else {
        res.json({ isLogin: false });
      }
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/isTwitterExist").post((req, res) => {
  const user = req.body.user;
  const dID = req.body.deviceId;

  let output = {};
  let dataSession = {};

  Broadcaster.findOne({ twID: user }, {})
    .then((broadcaster) => {
      if (broadcaster) {
        const id = broadcaster._id;
        const token = JWT.sign({ id }, process.env.JWTSECRET, {});
        output = {
          isLogin: true,
          idBroadcaster: broadcaster._id,
          nickname: broadcaster.nickname,
          codeBroadcaster: broadcaster.idBroadcaster,
          picture: broadcaster.picture,
          token: token,
          userInfo: broadcaster,
        };
        dataSession = { deviceId: dID, token: token };

        UserSession.findOneAndUpdate(
          {
            idBroadcaster: ObjectId(broadcaster._id),
          },
          {
            $set: dataSession,
          },
          { upsert: true }
        )
          .then((sess) => res.json(output))
          .catch((err) => {
            res.status(400).send(err.toString());
          });
      } else {
        res.json({ isLogin: false });
      }
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/isAppleExist").post((req, res) => {
  const user = req.body.user;
  const dID = req.body.deviceId;

  let output = {};
  let dataSession = {};

  Broadcaster.findOne({ appleID: user }, {})
    .then((broadcaster) => {
      if (broadcaster) {
        const id = broadcaster._id;
        const token = JWT.sign({ id }, process.env.JWTSECRET, {});
        output = {
          isLogin: true,
          idBroadcaster: broadcaster._id,
          nickname: broadcaster.nickname,
          codeBroadcaster: broadcaster.idBroadcaster,
          picture: broadcaster.picture,
          token: token,
          userInfo: broadcaster,
        };
        dataSession = { deviceId: dID, token: token };

        UserSession.findOneAndUpdate(
          {
            idBroadcaster: ObjectId(broadcaster._id),
          },
          {
            $set: dataSession,
          },
          { upsert: true }
        )
          .then((sess) => res.json(output))
          .catch((err) => {
            res.status(400).send(err.toString());
          });
      } else {
        res.json({ isLogin: false });
      }
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/updateBroadLevel").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var exps = req.body.exps;

  Level.findOne({
    expmin: { $lte: exps },
    expmax: { $gte: exps },
  })
    .then((broadcasterLevel) => {
      Broadcaster.updateOne(
        { _id: ObjectId(idBroadcaster) },
        {
          $set: {
            "stats.level": broadcasterLevel.rank,
            "stats.expsMin": broadcasterLevel.expmin,
            "stats.expsMax": broadcasterLevel.expmax,
          },
        }
      ).then((broadcaster) => res.json(broadcaster));
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/resetPassword").post((req, res) => {
  var phone = req.body.phone;
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    Broadcaster.updateOne({ phone: phone }, { $set: { password: hash } })
      .then((broadcaster) => {
        res.json(broadcaster);
      })
      .catch((err) => res.status(400).send(err.toString()));
  });
});

router.route("/setHiddenEntry").post((req, res) => {
  var idBroadcaster = req.body.idBroadcaster;
  var hidden = req.body.hidden;
  Broadcaster.updateOne(
    { _id: ObjectId(idBroadcaster) },
    { $set: { "settings.isHidden": hidden } }
  )
    .then((broadcaster) => {
      res.json(broadcaster);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/setGoldenNumber").post((req, res) => {
  var id = req.body.id;
  var idBroadcaster = req.body.idBroadcaster;
  var goldenNumber = req.body.goldenNumber;
  console.log(id);
  let newGoldenNumberHistory = new GoldenNumberHistory({
    idBroadcaster: ObjectId(id),
    idAdmin: "",
    oldID: idBroadcaster,
    newID: goldenNumber,
  });
  Broadcaster.findOne({ idBroadcaster: goldenNumber })
    .then((broadcaster) => {
      if (broadcaster) {
        return res.json(broadcaster);
      } else {
        console.log("wsolt lena");
        GoldenNumber.updateOne(
          { idBroadcaster: ObjectId(id) },
          { $set: { oldID: idBroadcaster, NewID: goldenNumber, state: "1" } },
          { upsert: true }
        ).then((goldenNumber) => {
          newGoldenNumberHistory.save().then((res) => {
            console.log(res);
          });
        });
        Broadcaster.updateOne(
          { idBroadcaster: idBroadcaster },
          { $set: { idBroadcaster: goldenNumber } }
        )
          .then((broadcaster) => {
            res.json(broadcaster);
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log(err);
      err.status(400).send(err.toString());
    });
});

router.route("/getGoldenNumbers").post((req, res) => {
  var currentBroadcaster = req.body.broadcaster;
  var query = req.body.query;
  var pageOptions = {
    page: parseInt(req.body.page, 10) || 0,
    limit: parseInt(req.body.limit, 10) || 10,
  };
  // { "$unwind": "$garranti" },
  // { "$lookup": {
  //   "from": "osoby",
  //   "as": "garranti.garrant",
  //   "localField": "garranti.id",
  //   "foreignField": "_id"
  // }},
  // { "$unwind": "$garranti.garrant" },
  // { "$group": {
  //   "_id": "$_id",
  //   "garranti": { "$push": "$garranti" }
  // }}
  GoldenNumber.aggregate([
    {
      $lookup: {
        from: "broadcasters",
        localField: "idBroadcaster",
        foreignField: "_id",
        as: "goldens",
      },
    },
    {
      $match: {
        $or: [
          { oldID: { $regex: ".*" + query + ".*" } },
          { NewID: { $regex: ".*" + query + ".*" } },
          {
            "goldens.nickname": { $regex: ".*" + query + ".*", $options: "i" },
          },
        ],
      },
    },
    { $unwind: "$goldens" },
    {
      $project: {
        idBroadcaster: 1,
        oldID: 1,
        NewID: 1,
        "goldens.nickname": 1,
        "goldens.picture": 1,
        "goldens.stats.level": 1,
        updatedAt: 1,
      },
    },
    { $skip: pageOptions.page * pageOptions.limit },
    { $limit: pageOptions.limit },
  ])
    .then((broadcasters) => {
      res.json(broadcasters);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/getGoldenNumbersHistory").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;

  GoldenNumberHistory.find({ idBroadcaster: ObjectId(idBroadcaster) })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

module.exports = router;

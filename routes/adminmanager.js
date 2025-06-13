const router = require("express").Router();

let adminManager = require("../models/adminmanager.model");
let Broadcaster = require("../models/brodcaster.model");
var ObjectId = require("mongoose").Types.ObjectId;

router.route("/addAdmin").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const adminId = req.body.idAdmin;
  const level = req.body.level;
  const date = Date.parse(new Date());

  adminManager
    .findOne({ broadcasterId: ObjectId(idBroadcaster) })
    .then((adm) => {
      if (adm == null) {
        adminManager
          .findOneAndUpdate(
            { broadcasterId: ObjectId(idBroadcaster) },
            {
              $push: {
                admins: {
                  adminId,
                  level,
                  date,
                },
              },
            },
            { upsert: true }
          )
          .then((admin) =>
            res.json({ error: false, message: "ADMIN_ADDED_WITH_SUCCESS" })
          )
          .catch((err) => {
            res.status(400).send(err.toString());
          });
      }

      if (adm != null) {
        if (adm.admins.length < 5) {
          adminManager
            .findOneAndUpdate(
              { broadcasterId: ObjectId(idBroadcaster) },
              {
                $push: {
                  admins: {
                    adminId,
                    level,
                    date,
                  },
                },
              },
              { upsert: true }
            )
            .then((admin) =>
              res.json({ error: false, message: "ADMIN_ADDED_WITH_SUCCESS" })
            )
            .catch((err) => {
              res.status(400).send(err.toString());
            });
        } else if (adm.admins.length > 4) {
          res.json({ error: true, message: "ADMIN_LIMIT_EXCEEDED" });
        }
      }
    })
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/addBlock").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const blockedId = req.body.blockedId;
  const status = req.body.status;
  const blockedBy = req.body.blockedBy;
  const isUpdate = req.body.isUpdate || false;
  const date = Date.parse(new Date());
  if (!isUpdate) {
    adminManager
      .findOneAndUpdate(
        { broadcasterId: ObjectId(idBroadcaster) },
        {
          $push: {
            blocked: {
              blockedId,
              blockedBy,
              status,
              date,
            },
          },
        },
        { upsert: true }
      )
      .then((blocked) => res.json(blocked))
      .catch((err) => {
        res.status(400).send(err.toString());
      });
  } else {
    adminManager
      .findOneAndUpdate(
        {
          broadcasterId: ObjectId(idBroadcaster),
          "blocked.blockedId": ObjectId(blockedId),
        },
        {
          $set: {
            "blocked.status": status,
          },
        },
        { upsert: true }
      )
      .then((blocked) => res.json(blocked))
      .catch((err) => {
        res.status(400).send(err.toString());
      });
  }
});

router.route("/isAdmin").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const adminId = req.body.adminId;

  adminManager
    .findOne({
      broadcasterId: ObjectId(idBroadcaster),
      "admins.adminId": ObjectId(adminId),
    })
    .then((admin) => res.json(admin))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/isBlocked").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const blockedId = req.body.adminId;

  adminManager
    .findOne({
      broadcasterId: ObjectId(idBroadcaster),
      "blocked.blockedId": ObjectId(blockedId),
    })
    .then((admin) => res.json(admin))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/isAdminBlock").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const userId = req.body.userId;
  Promise.all([
    adminManager.findOne({
      broadcasterId: ObjectId(idBroadcaster),
      "admins.adminId": userId,
    }),
    adminManager.findOne(
      {
        broadcasterId: ObjectId(idBroadcaster),
        blocked: { $elemMatch: { blockedId: userId } },
      },
      { "blocked.$": 1 }
    ),
    adminManager.findOne(
      {
        broadcasterId: ObjectId(userId),
        blocked: { $elemMatch: { blockedId: idBroadcaster } },
      },
      { "blocked.$": 1 }
    ),
  ])
    .then(([admin, blocked, viewerBlocked]) => {
      let isAdmin = admin ? true : false;
      let blockedStatus = blocked ? blocked.blocked[0].status : -1;
      let viewerBlockedStatus = viewerBlocked
        ? viewerBlocked.blocked[0].status
        : -1;
      console.log(blocked);
      res.json({ isAdmin, blockedStatus, viewerBlockedStatus });
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/getListAdmin").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;

  adminManager
    .aggregate([
      {
        $match: {
          broadcasterId: ObjectId(idBroadcaster),
        },
      },
      { $unwind: "$admins" },
      {
        $project: {
          adminId: "$admins.adminId",
          level: "$admins.level",
        },
      },
      {
        $lookup: {
          from: "broadcasters",
          localField: "adminId",
          foreignField: "_id",
          as: "broadcasterData",
        },
      },
      { $unwind: "$broadcasterData" },
      {
        $project: {
          adminId: 1,
          adminLevel: "$level",
          nickname: "$broadcasterData.nickname",
          picture: "$broadcasterData.picture",
          level: "$broadcasterData.stats.level",
        },
      },
    ])
    .then((list) => res.json(list))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/getListBlocked").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const status = req.body.status;

  adminManager
    .aggregate([
      {
        $match: {
          broadcasterId: ObjectId(idBroadcaster),
        },
      },
      { $unwind: "$blocked" },
      {
        $project: {
          blockedId: "$blocked.blockedId",
          status: "$blocked.status",
        },
      },
      {
        $match: {
          status: status,
        },
      },
      {
        $lookup: {
          from: "broadcasters",
          localField: "blockedId",
          foreignField: "_id",
          as: "broadcasterData",
        },
      },
      { $unwind: "$broadcasterData" },
      {
        $project: {
          blockedId: 1,
          nickname: "$broadcasterData.nickname",
          picture: "$broadcasterData.picture",
          level: "$broadcasterData.stats.level",
        },
      },
    ])
    .then((list) => res.json(list))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/removeAdmin").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const adminId = req.body.adminId;
  adminManager
    .findOneAndUpdate(
      {
        broadcasterId: ObjectId(idBroadcaster),
        "admins.adminId": ObjectId(adminId),
      },
      { $pull: { admins: { adminId: ObjectId(adminId) } } }
    )
    .then((admin) => res.json(admin))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/removeBlock").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const blockedId = req.body.blockedId;
  adminManager
    .findOneAndUpdate(
      {
        broadcasterId: ObjectId(idBroadcaster),
        "blocked.blockedId": ObjectId(blockedId),
      },
      { $pull: { blocked: { blockedId: ObjectId(blockedId) } } }
    )
    .then((admin) => res.json(admin))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

router.route("/rectifyBalance").post((req, res) => {
  let idBroadcaster = req.body.idBroadcaster;
  let coinsToSubstruct = parseInt(req.body.coinsToSubstruct, 10) || 0;
  let diamondsToSubstruct = parseInt(req.body.diamondsToSubstruct, 10) || 0;
  console.log(coinsToSubstruct);
  console.log("diamonds; ");
  console.log(diamondsToSubstruct)
    Broadcaster.updateOne(
      { idBroadcaster: idBroadcaster },
      // {
      //   $set: {
      //     "stats.coins": {
      //       $max: [
      //         0,
      //         {
      //           $subtract: ["$stats.coins", coinsToSubstruct],
      //         },
      //       ],
      //     },
      //     "stats.realdiamonds": {
      //       $max: [
      //         0,
      //         {
      //           $subtract: ["$stats.realdiamonds", diamondsToSubstruct],
      //         },
      //       ],
      //     },
      //     "stats.diamonds": {
      //       $max: [
      //         0,
      //         {
      //           $subtract: ["$stats.diamonds", diamondsToSubstruct],
      //         },
      //       ],
      //     },
      //   },
      // }
      {$inc: { "stats.coins" : -coinsToSubstruct,  "stats.realdiamonds" : -diamondsToSubstruct, "stats.diamonds": -diamondsToSubstruct}}
    )
    .then((broadcaster) => res.json(broadcaster))
    .catch((err) => {
      res.status(400).send(err.toString());
    });
});

module.exports = router;

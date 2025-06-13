const router = require("express").Router();
const jwt = require("jsonwebtoken");

let Broadcaster = require("../models/brodcaster.model");
let SystemRecharge = require("../models/systemrecharge.model");
let Transaction = require("../models/rechargetransaction.model");
var ObjectId = require("mongoose").Types.ObjectId;

const addTransaction = (
  res,
  idBroadcaster,
  transactionId,
  transactionref,
  coinValue,
  price,
  status
) => {
  console.log(idBroadcaster, transactionId, transactionref, coinValue, status);
  const newTransaction = new SystemRecharge({
    idBroadcaster,
    transactionId,
    transactionRef: transactionref,
    coinValue,
    price,
    status,
  });

  newTransaction
    .save()
    .then((result) => {
      Broadcaster.updateOne(
        { _id: ObjectId(idBroadcaster) },
        { $inc: { "stats.coins": coinValue } }
      )
        .then((added) =>
          res.json({ error: false, message: "COINS_ADDED_WITH_SUCCESS" })
        )
        .catch((err) => res.status(400).send(err.toString()));
    })
    .catch((err) => res.status(400).send(err.toString()));
};

const addFailedTransaction = (
  res,
  idBroadcaster,
  transactionId,
  transactionref,
  coinValue,
  price,
  status
) => {
  console.log(idBroadcaster, transactionId, transactionref, coinValue, status);
  const newTransaction = new SystemRecharge({
    idBroadcaster,
    transactionId,
    transactionRef: transactionref,
    coinValue,
    price,
    status,
  });
  newTransaction
    .save()
    .then((result) => {
      res.json({ error: true, message: "COINS_NOT_ADDED" });
    })
    .catch((err) => res.status(400).send(err.toString()));
};

router.route("/makeRechargeTransaction").post((req, res) => {
  const idBroadcaster = req.body.idBroadcaster;
  const transactionId = req.body.transactionid;
  const transactionref = req.body.transactionref;
  const coinValue = parseInt(req.body.coinsToRecharge);
  const price = parseFloat(req.body.price);
  const status = 1;

  try {
    const decodedToken = jwt.verify(transactionId, process.env.FRONTJWTSECRET);
    console.log("token verified", decodedToken);
    addTransaction(
      res,
      idBroadcaster,
      transactionId,
      transactionref,
      coinValue,
      price,
      status
    );
  } catch {
    console.log("token not verified");

    res.json({ error: true });
    addFailedTransaction(
      res,
      idBroadcaster,
      transactionId,
      transactionref,
      coinValue,
      price,
      0
    );
  }
});

router.route("/systemTransactions").post((req, res) => {
  var pageOptions = {
    page: parseInt(req.body.page, 10) || 0,
    limit: parseInt(req.body.limit, 10) || 10,
  };
  let query = req.body.query;
  let idBroadcaster = req.body.idBroadcaster;

  SystemRecharge.find({})
    .populate("idBroadcaster", [
      "picture",
      "nickname",
      "idBroadcaster",
      "stats.coins",
    ])
    .populate("idRecharger", ["name"])
    .sort({ updatedAt: -1 })
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

router.route("/getTransactions").post((req, res) => {
  var pageOptions = {
    page: parseInt(req.body.page, 10) || 0,
    limit: parseInt(req.body.limit, 10) || 10,
  };
  let query = req.body.query;
  let idBroadcaster = req.body.idBroadcaster;

  Transaction.find({})
    .populate("idBroadcaster", [
      "picture",
      "nickname",
      "idBroadcaster",
      "stats.coins",
    ])
    .populate("idRecharger", ["name"])
    .sort({ updatedAt: -1 })
    // .skip(pageOptions.page * pageOptions.limit)
    // .limit(pageOptions.limit)
    .exec(function (err, doc) {
      if (err) {
        res.status(500).json(err);
        return;
      }
      res.status(200).json(doc);
    });
});

router.route("/googleTransactions").post((req, res) => {
    var pageOptions = {
      page: parseInt(req.body.page, 10) || 0,
      limit: parseInt(req.body.limit, 10) || 10,
    };
    let query = req.body.query;
    let idBroadcaster = req.body.idBroadcaster;
  
    SystemRecharge.find({})
      .populate("idBroadcaster", [
        "picture",
        "nickname",
        "idBroadcaster",
        "stats.coins",
      ])
      .populate("idRecharger", ["name"])
      .sort({ updatedAt: -1 })
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
  
module.exports = router;

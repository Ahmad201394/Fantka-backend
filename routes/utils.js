const {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} = require("agora-access-token");
const uniqid = require("uniqid");
const router = require("express").Router();
var geoip = require("geoip-country");
var hashAuthToken = require("../helper/hashAuthToken")(
  "super-secret-random-string"
);

let Country = require("../models/country.model");
let SmsToken = require("../models/smstoken.model");
const appID = process.env.AGORA_APPID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
const uid = 0;
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600;

// Build token for Live Channel

/* getToken */
router.route("/getToken").get((req, res) => {
  
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const channelName = process.env.PREFIX + uniqid();
  
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  
  res.json({ channel: channelName, token: token });
});

router.route("/getCountries").post((req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let selectIp = ip.replace("::ffff:", "");

  Country.find()
    .then((countries) => {
      var geo = geoip.lookup(ip);
      console.log(geo);
      res.json({ ip: selectIp, countries: countries, locationData: geo });
    })
    .catch((err) => res.status(400).json("Error: ", err));
});

router.route("/getLiveCountries").post((req, res) => {
  Country.find()
    .then((countries) => {
      res.json({ countries: countries });
    })
    .catch((err) => res.status(400).json("Error: ", err));
});

router.route("/setSmsToken").post((req, res) => {
  const phone = req.body.phone;
  // const code = req.body.code;
  const code = "0000";
  const token = hashAuthToken.generate({ code, phone }, 600);

  const query = { phone };
  const update = { $set: { code, token } };
  const options = { upsert: true };
  SmsToken.updateOne(query, update, options)
    .then((token) => {
      res.json(token);
    })
    .catch((err) => res.status(400).send(err.toString()));
});

router.route("/verifySmsToken").post((req, res) => {
  const phone = req.body.phone;
  const code = req.body.code;

  SmsToken.findOne({ phone, code }, {}, { sort: { createdAt: -1 } })
    .then((token) => {
      var tokenObj = token ? hashAuthToken.verify(token.token) : { status: -2 };
      res.json(tokenObj);
    })
    .catch((err) => res.status(400).send(err.toString()));
});
module.exports = router;

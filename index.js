// module
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cron = require("node-cron");
let LiveStream = require("./models/livestream.model");
let Broadcaster = require("./models/brodcaster.model");
var ObjectId = require("mongoose").Types.ObjectId;
const winston = require("winston");
const jwt = require("jsonwebtoken");
let moment = require("moment");

let endDay = moment().utc().endOf("day").toString();
console.log("end day ", endDay);

const logConfiguration = {
  transports: [
    new winston.transports.File({
      level: "info",
      // Create the log directory if it does not exist
      filename:
        "public/uploads/logs/" +
        new Date().getDate() +
        "-" +
        new Date().getMonth() +
        "-" +
        new Date().getFullYear() +
        ".log",
    }),
  ],
  format: winston.format.combine(
    winston.format.label({
      label: `live`,
    }),
    winston.format.timestamp({
      format: "MM-DD-YYYY HH:mm:ss",
    }),
    winston.format.printf(
      (info) =>
        `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  ),
};

const logger = winston.createLogger(logConfiguration);

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

process.env.TZ = "Asia/Tehran";

const server = require("http").createServer(app);
const io = require("socket.io")(server, { origins: "*:*" });

//app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({ credentials: true }));

app.use(function (req, res, next) {
  console.log(`Requested URL: ${req.method} ${req.url}`);
  next();
});

app.use(function (req, res, next) {
  var allowedDomains = [
    "https://recharge.fantkalive.com",
    "http://localhost:3000",
    "https://fantkadmin.fantkalive.com",
  ];
  var origin = req.headers.origin;
  if (allowedDomains.indexOf(origin) > -1) {
    res.header("Access-Control-Allow-Origin", origin);
    console.log("may origin : ", origin);
  }

  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/static", express.static("public"));
console.log('MONGO_URI:', process.env.MONGO_URI);
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const isLogger = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    const userId = decodedToken.id;
    console.log(token, userId);
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: "Unautorized !",
    });
  }
};

// routes
const streamRouter = require("./routes/streaming");
app.use("/stream", streamRouter);

const utilsRouter = require("./routes/utils");
app.use("/utils", utilsRouter);

const broadcasterRouter = require("./routes/broadcaster");
app.use("/broadcaster", broadcasterRouter);

const categoryRouter = require("./routes/category");
app.use("/category", categoryRouter);

const countryRouter = require("./routes/country");
app.use("/country", countryRouter);

const followersRouter = require("./routes/followers");
app.use("/followers", followersRouter);

const giftRouter = require("./routes/gift");
app.use("/gift", giftRouter);

const storeRouter = require("./routes/store");
app.use("/store", storeRouter);

const chatRouter = require("./routes/chat");
app.use("/chat", chatRouter);

const statsRouter = require("./routes/stats");
app.use("/stats", statsRouter);

const levelRouter = require("./routes/level");
app.use("/level", levelRouter);

const adminManagerRouter = require("./routes/adminmanager");
app.use("/adminManager", adminManagerRouter);

const VisitProfileRouter = require("./routes/visitprofile");
app.use("/visitors", VisitProfileRouter);

const AgencyRouter = require("./routes/agency");
app.use("/agency", AgencyRouter);

const PrizesRouter = require("./routes/prizes");
app.use("/prizes", PrizesRouter);

const BattleRouter = require("./routes/battle");
app.use("/battle", BattleRouter);

const convertRouter = require("./routes/convert");
app.use("/convert", convertRouter);

const mybagRouter = require("./routes/mybag");
app.use("/mybag", mybagRouter);

const broadSettingsRouter = require("./routes/broadcastersettings");
app.use("/settings", broadSettingsRouter);

const dailyGiftRouter = require("./routes/dailygift");
app.use("/dailygift", dailyGiftRouter);

const adminUsersRouter = require("./routes/dashboard/recharge");
app.use("/adminUsers", isLogger, adminUsersRouter);

const accessRouter = require("./routes/dashboard/access");
app.use("/access", accessRouter);

const superadminUsersRouter = require("./routes/dashboard/superadmin");
app.use("/superadmin", isLogger, superadminUsersRouter);

const dashboardAgencyRouter = require("./routes/dashboard/agency");
app.use("/dashboardAgency", dashboardAgencyRouter);

const guestBoxRouter = require("./routes/guestbox");
app.use("/guestbox", guestBoxRouter);

const intraRouter = require("./routes/intra");
app.use("/intra", intraRouter);

const notifRouter = require("./routes/notifications");
app.use("/notif", notifRouter);

const kingdomRouter = require("./routes/kingdom");
app.use("/kingdom", kingdomRouter);

const GiftAdminRouter = require("./routes/dashboard/giftAdmin");
app.use("/giftadmin", isLogger, GiftAdminRouter);

const MyBagAdminRouter = require("./routes/dashboard/mybagAdmin");
app.use("/mybagadmin", isLogger, MyBagAdminRouter);

const GeneralRouter = require("./routes/general");
app.use("/global", GeneralRouter);

const SlideRouter = require("./routes/slides");
app.use("/slides", SlideRouter);

const transactionRouter = require("./routes/transactions");
const expressListEndpoints = require("express-list-endpoints");
app.use("/transaction", transactionRouter);

io.on("connection", (client) => {
  console.log("conectit bech...");
  client.on("liveMsg", (data) => {
    console.log("livemsg", data);
    io.emit("liveMsg", data);
  });
  client.on("joinAudiance", (data) => {
    console.log("join live", data);
    io.emit("joinAudiance", data);
  });
  client.on("leaveAudiance", (data) => {
    console.log("leave live", data);
    io.emit("leaveAudiance", data);
  });
  client.on("streamControl", (data) => {
    console.log("streamControl", data);
    io.emit("streamControl", data);
  });
  client.on("streamRequest", (data) => {
    console.log("streamRequest", data);
    io.emit("streamRequest", data);
  });
  client.on("acceptStreamRequest", (data) => {
    console.log("acceptStreamRequest", data);
    io.emit("acceptStreamRequest", data);
  });
  client.on("guestStreamControl", (data) => {
    console.log("guestStreamControl", data);
    io.emit("guestStreamControl", data);
  });
  client.on("giftSended", (data) => {
    console.log("giftSended", data);
    io.emit("giftSended", data);
  });
  client.on("hostGuestControl", (data) => {
    console.log("hostGuestControl", data);
    io.emit("hostGuestControl", data);
  });
  client.on("chatRoom", (data) => {
    console.log("chat room", data);
    io.emit("chatRoom", data);
  });
  client.on("battle", (data) => {
    console.log("battle", data);
    io.emit("battle", data);
  });
  client.on("livePost", (data) => {
    console.log("livePost", data);
    io.emit("livePost", data);
  });
  client.on("boxes", (data) => {
    console.log("boxes ", data);
    io.emit("boxes", data);
  });
  client.on("guestBoxes", (data) => {
    console.log("guestBoxes ", data);
    io.emit("guestBoxes", data);
  });
  client.on("audioCall", (data) => {
    console.log("audioCall ", data);
    io.emit("audioCall", data);
  });
  client.on("kingdomBeam", (data) => {
    console.log("kingdomBeam ", data);
    io.emit("kingdomBeam", data);
  });
  client.on("chatNotif", (data) => {
    console.log("chatNotif ", data);
    io.emit("chatNotif", data);
  });

  client.on("disconnect", () => {
    console.log("disconnect");
  });
});

var currentBoxs = [];
var task = cron.schedule(
  "0 */10 * * * *",
  () => {
    LiveStream.find(
      { status: 1, multibeamLayout: 1, "stats.diamonds": { $gt: 2500 } },
      null,
      { sort: { "stats.diamonds": -1 } }
    )
      .limit(3)
      .then((streams) => {
        currentBoxs = [];
        if (streams.length > 0) {
          streams.forEach((item, index) => {
            let newBox = {
              id: item._id,
              maxCoins: 25,
              broadcasters: [],
            };
            currentBoxs.push(newBox);
          });
          io.emit("boxes", { boxes: currentBoxs, action: "getBoxes" });
          console.log({ boxes: currentBoxs, action: "getBoxes" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  {
    scheduled: true,
  }
);

task.start();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

app.post("/sendBox", function (req, res) {
  const idBroadcaster = req.body.idBroadcaster;
  const idBox = req.body.idBox;
  const index = currentBoxs.findIndex((box) => box.id == idBox);

  if (
    currentBoxs.length > 0 &&
    index != -1 &&
    currentBoxs[index].maxCoins != 0 &&
    currentBoxs[index].broadcasters.length < 15 &&
    currentBoxs[index].broadcasters.findIndex(
      (broadcaster) => broadcaster.idBroadcaster == idBroadcaster
    ) == -1
  ) {
    const random = getRandomInt(1, currentBoxs[index].maxCoins);
    Broadcaster.updateOne(
      { _id: ObjectId(idBroadcaster) },
      { $inc: { "stats.coins": random } }
    )
      .then((broadcaster) => {
        maxCoins = currentBoxs[index].maxCoins - random;
        currentBoxs[index].maxCoins = maxCoins;
        currentBoxs[index].broadcasters.push({
          idBroadcaster: ObjectId(idBroadcaster),
          value: random,
        });
        res.json({ random, box: currentBoxs[index], currentBoxs });
      })
      .catch((err) => res.status(400).send(err.toString()));
  } else {
    res.json(-1);
  }
});

app.post("/getBoxsStats", function (req, res) {
  const idBox = req.body.idBox;
  const index = currentBoxs.findIndex((box) => box.id == idBox);

  if (currentBoxs.length > 0 && index != -1) {
    let broadcasterIds = [];
    currentBoxs[index].broadcasters.forEach((item, index) => {
      broadcasterIds.push(item.idBroadcaster);
    });

    Broadcaster.find(
      { _id: { $in: broadcasterIds } },
      { nickname: 1, picture: 1, "stats.level": 1 }
    )
      .then((broadcasters) => {
        let result = [];
        broadcasters.forEach((item) => {
          result.push({
            nickname: item.nickname,
            picture: item.picture,
            level: item.stats.level,
            value:
              currentBoxs[index].broadcasters[
                currentBoxs[index].broadcasters.findIndex(
                  (broadcaster) =>
                    broadcaster.idBroadcaster == item._id.toString()
                )
              ].value,
          });
        });
        res.json(result);
      })
      .catch((err) => res.status(400).send(err.toString()));
  } else {
    res.json(-1);
  }
});

app.post("/sendLog", function (req, res) {
  const message = req.body.message;
  logger.info(message);
  res.json("sended");
});

app.get("/list-routes", function (req, res) {
  res.json(expressListEndpoints(app));
});
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});

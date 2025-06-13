const router = require('express').Router();
const bcrypt = require('bcrypt');
var randtoken = require('rand-token').generator();
var path = require('path');
let multer = require("multer");
const { ObjectId } = require('mongoose').Types; // ✅ استخدم هذا الصحيح
const JWT = require('jsonwebtoken');

const fs = require('fs');
const client = require('https');
const Broadcaster = require('../models/brodcaster.model');
const UserSession = require('../models/userSession.model');

router.route('/login').post((req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    const dID = req.body.deviceId;

    let output = {};
    let dataSession = {};

    Broadcaster.findOne({ $or: [{ email: user }, { phone: user.replace('+', '') }, { localphone: user.replace('+', '') }] }, {})
        .then(broadcaster => {
            if (broadcaster) {
                bcrypt.compare(pass, broadcaster.password, (error, response) => {
                    if (response) {
                        const id = broadcaster._id;
                        const token = JWT.sign({ id }, process.env.JWTSECRET, {});
                        output = {
                            isLogin: true,
                            idBroadcaster: broadcaster._id,
                            nickname: broadcaster.nickname,
                            codeBroadcaster: broadcaster.idBroadcaster,
                            picture: broadcaster.picture,
                            token: token,
                            userInfo: broadcaster
                        };
                        dataSession = { deviceId: dID, token: token };

                        UserSession.findOneAndUpdate(
                            {
                                idBroadcaster: new ObjectId(broadcaster._id) // ✅ استخدم new ObjectId هنا
                            },
                            {
                                $set: dataSession
                            },
                            { upsert: true }
                        )
                            .then(sess => res.json(output))
                            .catch(err => { res.status(400).send((err).toString()) });
                    }
                    else {
                        res.json({ isLogin: false, message: "Wrong username/password combination!" });
                    }
                });
            }
            else {
                res.json({ isLogin: false, message: "Wrong username/password combination!" });
            }
        })
        .catch(err => res.status(400).send((err).toString()));
});

router.route('/verifSession').post((req, res) => {
    const dID = req.body.deviceId;
    const token = req.body.token;
    const broadcasterID = req.body.broadcasterid;

    UserSession.findOne({ idBroadcaster: new ObjectId(broadcasterID), deviceId: dID, token: token }) // ✅ استخدم new ObjectId هنا
        .then(sess => {
            //FIXME: CHECK THIS IS RETURNING FALSE
            const output = (sess == null) ? { verified: false } : { verified: true }; // ✅ عدلت حسب المنطق الصحيح
            res.json(output);
        })
        .catch(err => { res.status(400).send((err).toString()) });
});

module.exports = router;

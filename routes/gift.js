const router = require('express').Router();
let GiftTransaction = require('../models/gifttransaction.model');
let Broadcaster = require('../models/brodcaster.model');
let LiveStream = require('../models/livestream.model');
let GiftItem = require('../models/gift.model');
let BattleSession = require('../models/battlesession.model');
let Kingdom = require('../models/kingdom.model');
let kingdomTaskTransaction = require('../models/kingdomtasktransaction.model');
var ObjectId = require('mongoose').Types.ObjectId;

router.route('/sendGift').post((req, res) => {
    const idReciever    = req.body.idReciever;
    const idLiveStream  = req.body.idLiveStream || null;
    const idKingdom     = req.body.idKingdom || null;
    const idRound       = req.body.idRound || null;
    const idSender      = req.body.idSender;
    const idGift        = req.body.idGift;
    const quantity      = req.body.quantity;
    const value         = req.body.value;
    const owner         = req.body.owner;
    const idTask         = req.body.idTask || null;

    var kTaskTransaction = new kingdomTaskTransaction( {
        idTask : idTask,
        idBroadcaster : idReciever,
        idKingdom : idKingdom,
        value : value,
        state : 1,
    });

    var giftObject = new GiftTransaction({
        idReciever,
        idLiveStream,
        idKingdom,
        idSender,
        idGift,
        quantity,
        value,
    });

    //var gifter = { idAudiance: idSender, idStream: idLiveStream, value : value };   

    giftObject.save()
    .then(gift => {
        Promise.all([
            Broadcaster.updateOne({ _id: idReciever }, {$inc: {"stats.diamonds" : value, "stats.realdiamonds" : value} }),
            Broadcaster.updateOne({ _id: idSender }, {$inc: {"stats.coins" : -value} }),
            Broadcaster.updateOne({ _id: idSender }, {$inc: {"stats.exps" : value} }),
            (idLiveStream != null) ? LiveStream.updateOne({_id: ObjectId(idLiveStream), "streamers.idCoBroadcaster" : ObjectId(idReciever) },  { $inc: {"streamers.$.diamonds" : value} } ) : null,
            (idLiveStream != null && idReciever == owner) ? LiveStream.updateOne({_id: ObjectId(idLiveStream), "audiance.idAudiance" : ObjectId(idSender) },  { $inc: {"audiance.$.sendedDiamond" : value} } ) : null,
            (idLiveStream != null && idReciever == owner) ? LiveStream.updateOne({ _id:  ObjectId(idLiveStream) }, {$inc: {"stats.diamonds" : value} }) : null,
            (idLiveStream != null && idRound != null) ? BattleSession.updateOne({ _id:  ObjectId(idRound), "battleStreams.idLive" : ObjectId(idLiveStream) }, {$inc: {"battleStreams.$.score" : value}} ) : null,
            ( idKingdom != null && idReciever == owner ) ? Kingdom.updateOne({ _id:  ObjectId(idKingdom) }, {$inc: {"stats.score" : value}} ) : null,
            ( idKingdom != null && idTask != null  && idReciever == owner ) ? kTaskTransaction.save() : null,
        ]).then( ([ res1, res2, res3, res4, res5, res6, res7, res8, res9 ]) => {
            res.json({ res1, res2, res3, res4, res5, res6, res7, res8, res9 })
        }).catch(err => res.status(400).send((err).toString()));
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/updateStreamGifters').post((req, res) => {

    const streamID = req.body.streamID;
    const gifterId = req.body.gifterId;
    const gifterAvatar = req.body.gifterAvatar;
    const gifterName = req.body.gifterName;
    const reciverId = req.body.reciverId;
    const giftValue = req.body.giftValue;

    var gifterData = {
        gifterId,
        gifterAvatar,
        gifterName,
        reciverId,
        giftValue
    };

    LiveStream.findOne({ _id: ObjectId(streamID), gifters: { $elemMatch: { gifterId: ObjectId(gifterId), reciverId: ObjectId(reciverId) } } })
    .then(gifts => {
        if (!gifts)
        LiveStream.updateOne({ _id: ObjectId(streamID) }, { $push: { gifters: gifterData } })
          .then(gf => res.json(gf))
          .catch(err => { res.status(400).send((err).toString()) });
      else
        LiveStream.updateOne({ _id: ObjectId(streamID), gifters: { $elemMatch: { gifterId: ObjectId(gifterId), reciverId: ObjectId(reciverId) } } }, { $inc: { "gifters.$.giftValue": giftValue } })
          .then(gf => res.json(gf))
          .catch(err => { res.status(400).send((err).toString()) });
    } )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getStreamGift').post((req, res) => {
    GiftItem.find({type : 1})
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));
});


router.route('/getStreamGift1').post((req, res) => {
    GiftItem.find({"tabs.gifts" : "Love"  }, { "tabs.$": 1 })
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));
});

router.route('/updateGift').post((req, res) => {
    let giftId = req.body.giftId;
    let type = req.body.type;
    GiftItem.updateOne({"gifts._id" : ObjectId(giftId)},  
    { $set: 
      { 
        "gifts.$.type" : type,
      }
    })
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));
});



router.route('/updateBroadcasterCoins').post((req, res) => {

    const idSender      = req.body.idSender;
    const value         = req.body.value;

    Broadcaster.updateOne({ _id: idSender }, {$inc: {"stats.coins" : -value} })
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});



router.route('/addGift').post((req, res) => {

 

    var gifts =  [

        {
            "quantities": [
                1,
                9,
                49,
                99
            ],
            "title": "The heart",
            "icon": "01_love_heart_icon.png",
            "animation": "01_love_heart_anim.gif",
            "audio" : "love01.mp3",
            "type" : 1,
            "value": 10
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "The kiss",
            "icon": "02_love_kiss_icon.png",
            "animation": "02_love_kiss_anim.gif",
            "audio" : "love02.mp3",
            "type" : 1,
            "value": 60
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Love Bear",
            "icon": "03_love_bear_icon.png",
            "animation": "03_love_bear_anim.png",
            "audio" : "love03.mp3",
            "type" : 1,
            "value": 299
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Resala",
            "icon": "04_love_risala_icon.png",
            "animation": "04_love_risala.webp",
            "audio" : "love04.mp3",
            "type" : 2,
            "value": 600
        },
        {
            "quantities": [
                1,
                6,
                9
            ],

            "title": "King Crown",
            "icon": "05_love_crown_icon.png",
            "animation": "05_love_king_crown.webp",
            "audio" : "love05.mp3",
            "type" : 2,
            "value": 1200
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Crystal shoes",
            "icon": "06_love_shoes_icon.png",
            "animation": "06_love_shoes.webp",
            "audio" : "love06.mp3",
            "type" : 2,
            "value": 1700
        },

        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Angel Girl",
            "icon": "07_love_angel_icon.png",
            "animation": "07_love_angelgirl.webp",
            "audio" : "love07.mp3",
            "type" : 2,
            "value": 2999
        },
        {
            "quantities": [
                1,
                3,
                9
            ],
            "title": "Love Bubble",
            "icon": "08_love_bubble_icon.png",
            "animation": "08_love_love_bubble.webp",
            "audio" : "love08.mp3",
            "type" : 2,
            "value": 7000
        },
    ];

    let giftitem = new GiftItem({

        "title": "Love",
        "type": 1,
        "gifts" : gifts
    })

    giftitem.save()
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/addGift2').post((req, res) => {

 

    var gifts =  [

        {
            "quantities": [
                1,
                9,
                49,
                99
            ],
            "title": "Ice Cream",
            "icon": "01_sea_icecream_icon.png",
            "animation": "01_sea_icecream_anim.png",
            "audio" : "sea01.mp3",
            "type" : 1,
            "value": 49
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "LolliPop",
            "icon": "02_sea_lollypop_icon.png",
            "animation": "02_sea_lollypop.webp",
            "audio" : "sea02.mp3",
            "type" : 1,
            "value": 69
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Star Sea",
            "icon": "03_sea_seastar_icon.png",
            "animation": "03_sea_seastar.webp",
            "audio" : "sea03.mp3",
            "type" : 2,
            "value": 99
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Sea Shell",
            "icon": "04_sea_seashell_icon.png",
            "animation": "04_sea_seashell.webp",
            "audio" : "sea04.mp3",
            "type" : 2,
            "value": 999
        },
        {
            "quantities": [
                1,
                6,
                9
            ],

            "title": "Fish",
            "icon": "05_sea_fish_icon.png",
            "animation": "05_sea_fish.webp",
            "audio" : "sea05.mp3",
            "type" : 2,
            "value": 1499
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Crocodile",
            "icon": "06_sea_crocodile_icon.png",
            "animation": "06_sea_crocodile.webp",
            "audio" : "sea06.mp3",
            "type" : 2,
            "value": 2999
        },

        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "DolPhin",
            "icon": "07_sea_dolphin_icon.png",
            "animation": "07_sea_dolphin.webp",
            "audio" : "sea07.mp3",
            "type" : 2,
            "value": 5999
        },
        {
            "quantities": [
                1,
                3,
                9
            ],
            "title": "Steamer",
            "icon": "08_sea_steamer_icon.png",
            "animation": "08_sea_steamer.webp",
            "audio" : "sea08.mp3",
            "type" : 2,
            "value": 9999
        },
    ];

    let giftitem = new GiftItem({

        "title": "Sea",
        "type": 1,
        "gifts" : gifts
    })

    giftitem.save()
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/addGift3').post((req, res) => {

 

    var gifts =  [

        {
            "quantities": [
                1,
                9,
                49,
                99
            ],
            "title": "Squirrel",
            "icon": "01_jungle_squirel.icon.png",
            "animation": "01_jungle_squirel.anim.png",
            "audio" : "jun01.mp3",
            "type" : 1,
            "value": 29
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Cat coins",
            "icon": "02_jungle_catcoins_icon.png",
            "animation": "02_jungle_catcoins.webp",
            "audio" : "jun02.mp3",
            "type" : 2,
            "value": 99
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Cobra Snake",
            "icon": "03_jungle_cobra_icon.png",
            "animation": "03_jungle_cobra.webp",
            "audio" : "jun03.mp3",
            "type" : 2,
            "value": 699
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Gorilla",
            "icon": "04_jungle_gorilla_icon.png",
            "animation": "04_jungle_gorilla.webp",
            "audio" : "jun04.mp3",
            "type" : 2,
            "value": 4999
        },
        {
            "quantities": [
                1,
                6,
                9
            ],

            "title": "Phoenix",
            "icon": "05_jungle_phoenix_icon.png",
            "animation": "05_jungle_phoenix.webp",
            "audio" : "jun05.mp3",
            "type" : 2,
            "value": 7999
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "White Horse",
            "icon": "06_jungle_whitehorse_icon.png",
            "animation": "06_jungle_whitehorse.webp",
            "audio" : "jun06.mp3",
            "type" : 2,
            "value": 9999
        },

        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Black Horse",
            "icon": "07_jungle_blackhorse_icon.png",
            "animation": "07_jungle_blackhorse.webp",
            "audio" : "jun07.mp3",
            "type" : 2,
            "value": 15000
        },
        {
            "quantities": [
                1,
                3,
                9
            ],
            "title": "Lion",
            "icon": "08_jungle_lion_icon.png",
            "animation": "08_jungle_lion.webp",
            "audio" : "jun08.mp3",
            "type" : 2,
            "value": 20000
        },
    ];

    let giftitem = new GiftItem({

        "title": "Jungle",
        "type": 1,
        "gifts" : gifts
    })

    giftitem.save()
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});

router.route('/addGift4').post((req, res) => {

 

    var gifts =  [

        {
            "quantities": [
                1,
                9,
                49,
                99
            ],
            "title": "Motocycle",
            "icon": "01_machine_motocycle_icon.png",
            "animation": "01_machine_motocycle.webp",
            "audio" : "mach01.mp3",
            "type" : 2,
            "value": 299
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Racing Car",
            "icon": "02_machine_racingcar_icon.png",
            "animation": "02_machine_racingcar.webp",
            "audio" : "mach02.mp3",
            "type" : 2,
            "value": 999
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Yellow Car",
            "icon": "03_machine_yellowcar_icon.png",
            "animation": "03_machine_yellowcar.webp",
            "audio" : "mach03.mp3",
            "type" : 2,
            "value": 999
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Red Ferrari",
            "icon": "04_machine_redferrary_icon.png",
            "animation": "04_machine_redferrary.webp",
            "audio" : "mach04.mp3",
            "type" : 2,
            "value": 4999
        },
        {
            "quantities": [
                1,
                6,
                9
            ],

            "title": "Jeep Car",
            "icon": "05_machine_jeepcar_icon.png",
            "animation": "05_machine_jeepcar.webp",
            "audio" : "mach05.mp3",
            "type" : 2,
            "value": 7999
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Train",
            "icon": "06_machine_train_icon.png",
            "animation": "06_machine_train.webp",
            "audio" : "mach06.mp3",
            "type" : 2,
            "value": 15000
        },

        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Helicopter",
            "icon": "07_machine_helicopter_icon.png",
            "animation": "07_machine_helicopter.webp",
            "audio" : "mach07.mp3",
            "type" : 2,
            "value": 20000
        },
        {
            "quantities": [
                1,
                3,
                9
            ],
            "title": "F16",
            "icon": "08_machine_f16_icon.png",
            "animation": "08_machine_f16.webp",
            "audio" : "mach08.mp3",
            "type" : 2,
            "value": 25000
        },
    ];

    let giftitem = new GiftItem({

        "title": "Machine",
        "type": 1,
        "gifts" : gifts
    })

    giftitem.save()
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/addGift5').post((req, res) => {

 

    var gifts =  [

        {
            "quantities": [
                1,
                9,
                49,
                99
            ],
            "title": "Fireworks",
            "icon": "mansion01.png",
            "animation": "mansion01_anim.webp",
            "audio" : "mans01.mp3",
            "type" : 2,
            "value": 3999
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Amusement Park",
            "icon": "mansion02.png",
            "animation": "mansion02_anim.webp",
            "audio" : "mans02.mp3",
            "type" : 2,
            "value": 7999
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Crystal Palace",
            "icon": "mansion03.png",
            "animation": "mansion03_anim.webp",
            "audio" : "mans03.mp3",
            "type" : 2,
            "value": 15000
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Golden Palace",
            "icon": "mansion04.png",
            "animation": "mansion04_anim.webp",
            "audio" : "mans04.mp3",
            "type" : 2,
            "value": 20000
        },
        {
            "quantities": [
                1,
                6,
                9
            ],

            "title": "Kuwait Towe",
            "icon": "mansion06.png",
            "animation": "mansion06_anim.webp",
            "audio" : "mans05.mp3",
            "type" : 2,
            "value": 40000
        },
        
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Khalifa Towers",
            "icon": "mansion07.png",
            "animation": "mansion07_anim.gif",
            "audio" : "mans07.mp3",
            "type" : 2,
            "value": 50000
        },
        {
            "quantities": [
                1,
                3,
                9
            ],
            "title": "Diamond Palace",
            "icon": "mansion08.png",
            "animation": "mansion08_anim.webp",
            "audio" : "mach08.mp3",
            "type" : 2,
            "value": 100000
        },
    ];

    let giftitem = new GiftItem({

        "title": "Mansions",
        "type": 1,
        "gifts" : gifts
    })

    giftitem.save()
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});


router.route('/addGift6').post((req, res) => {

 

    var gifts =  [

        {
            "quantities": [
                1,
                9,
                49,
                99
            ],
            "title": "Hand",
            "icon": "01_mixed_hand.png",
            "animation": "01_mixed_hand.png",
            "audio" : "mix01.mp3",
            "type" : 1,
            "value": 1
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Magic Stick",
            "icon": "02_mixed_stick.png",
            "animation": "02_mixed_stick.png",
            "audio" : "mix02.mp3",
            "type" : 1,
            "value": 5
        },
        {
            "quantities": [
                1,
                9,
                49
            ],
            "title": "Flower",
            "icon": "03_mixed_flower_icon.png",
            "animation": "03_mixed_flower.webp",
            "audio" : "mix03.mp3",
            "type" : 1,
            "value": 49
        },
        {
            "quantities": [
                1,
                6,
                9,
                49
            ],
            "title": "Donats",
            "icon": "04_mixed_donats_icon.png",
            "animation": "04_mixed_donats.webp",
            "audio" : "mix04.mp3",
            "type" : 1,
            "value": 69
        },
        {
            "quantities": [
                1,
                6,
                9
            ],

            "title": "Magic Ring",
            "icon": "05_mixed_magicring_icon.png",
            "animation": "05_mixed_magicring.webp",
            "audio" : "mix05.mp3",
            "type" : 2,
            "value": 149
        },
        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Jar",
            "icon": "06_mixed_jar_icon.png",
            "animation": "06_mixed_jar.webp",
            "audio" : "mix06.mp3",
            "type" : 2,
            "value": 299
        },

        {
            "quantities": [
                1,
                6,
                9
            ],
            "title": "Happy Birthday",
            "icon": "07_mixed_happybirth_icon.png",
            "animation": "07_mixed_happybirth.webp",
            "audio" : "mix07.mp3",
            "type" : 2,
            "value": 499
        },
        {
            "quantities": [
                1,
                3,
                9
            ],
            "title": "Alaa",
            "icon": "08_mixed_alaa_icon.png",
            "animation": "08_mixed_alaa.webp",
            "audio" : "mix08.mp3",
            "type" : 2,
            "value": 3999
        },
    ];

    let giftitem = new GiftItem({

        "title": "Mix",
        "type": 1,
        "gifts" : gifts
    })

    giftitem.save()
    .then(gifts => res.json(gifts) )
    .catch(err => res.status(400).send((err).toString()));

});


module.exports = router;


const router = require('express').Router();
let MyBag = require('../models/mybag.model');
let PrizesCategory = require('../models/prizescategory.model');
var ObjectId = require('mongoose').Types.ObjectId; 

const bagCat = [
    
{
    
    "title" : "Gifts",
    "inMyBag" : {
        "order" : 1,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},

{
    "title" : "Free",
    "inMyBag" : {
        "order" : 2,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},

{

    "title" : "Flying Comments",
    "inMyBag" : {
        "order" : 3,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},

{
   
    "title" : "Cards",
    "inMyBag" : {
        "order" : 4,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},


{
    "title" : "Entrance Effects",
    "myBagOrder" : 5,
    "inStore" : {
        "isInStore" : true,
        "order" : 1
    },
    "inMyBag" : {
        "order" : 5,
        "isInMyBag" : true
    }
},

{
    "title" : "Card Frames",
    "inMyBag" : {
        "order" : 6,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},
{
  
    "title" : "Avatar Frames",
    "myBagOrder" : 7,
    "inStore" : {
        "isInStore" : true,
        "order" : 2
    },
    "inMyBag" : {
        "order" : 7,
        "isInMyBag" : true
    }
},


{

    "title" : "Chat Bubble",
    "inMyBag" : {
        "order" : 8,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},

{
    "title" : "Shred",
    "inMyBag" : {
        "order" : 9,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},


{
    
    "title" : "Broadcaster Cards",
    "inMyBag" : {
        "order" : 10,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},

{

    "title" : "Room Decor",
    "myBagOrder" : 11,
    "inStore" : {
        "isInStore" : true,
        "order" : 3
    },
    "inMyBag" : {
        "order" : 11,
        "isInMyBag" : true
    }
},

{
    "title" : "Others",
    "inMyBag" : {
        "order" : 13,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : false,
        "order" : -1
    }
},

{
    "inMyBag" : {
        "order" : -1,
        "isInMyBag" : false
    },
    "inStore" : {
        "isInStore" : true,
        "order" : 4
    },
    "title" : "FAM",
},


{

    "inMyBag" : {
        "order" : 12,
        "isInMyBag" : true
    },
    "inStore" : {
        "isInStore" : true,
        "order" : 5
    },
    "title" : "Rocket Card",
}
];



router.route('/getBagItems').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const idCategory    = req.body.idCategory;
  
    MyBag.aggregate([
        {
            $match : {
                idBroadcaster : ObjectId(idBroadcaster)
            },
        },
        {
            $unwind : "$prizes"
        },
        {
            $addFields : {
                beforeEnd : {
                    $subtract : ["$prizes.end", new Date()]
                }
            }
        },
        {
            $match : {
                "prizes.idPrizeCat" : ObjectId(idCategory),
                beforeEnd : {$gt : 0}
            }
        },
        {
            $lookup:
            {
                from: "prizes",
                localField: "prizes.idPrize",
                foreignField: "_id",
                as: "prizeData"
            }
        },
        {
            $unwind : "$prizeData"
        },
        {
            $project : {
                idMyBag : "$prizes._id",
                idItem : "$prizeData._id",
                title : "$prizeData.title",
                idCategory : "$prizeData.idCategory",
                icon : "$prizeData.icon",
                qty : "$prizes.qty",
                duration : "$prizes.duration",
                start : "$prizes.start",
                end : "$prizes.end",
                status : "$prizes.status",
            }
        }
    ])
    .then(categories => res.json(categories))
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/getMyBagItems').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
  
    MyBag.aggregate([
        {
            $match : {
                idBroadcaster : ObjectId(idBroadcaster)
            },
        },
        {
            $unwind : "$prizes"
        },
        {
            $addFields : {
                beforeEnd : {
                    $subtract : ["$prizes.end", new Date()]
                }
            }
        },
        {
            $match : {
                "prizes.status" : 1,
                beforeEnd : {$gt : 0}
            }
        },
        {
            $lookup:
            {
                from: "prizes",
                localField: "prizes.idPrize",
                foreignField: "_id",
                as: "prizeData"
            }
        },
        {
            $unwind : "$prizeData"
        },
        {
            $project : {
                idMyBag : "$prizes._id",
                idItem : "$prizeData._id",
                title : "$prizeData.title",
                idCategory : "$prizeData.idCategory",
                prizeType : "$prizeData.prizeType",
                icon : "$prizeData.icon",
                animation : "$prizeData.animation",
                audio : "$prizeData.audio",
                qty : "$prizes.qty",
                duration : "$prizes.duration",
                start : "$prizes.start",
                end : "$prizes.end",
                status : "$prizes.status",
            }
        }
    ])
    .then(categories => res.json(categories))
    .catch(err => {res.status(400).send((err).toString())});
});

  
router.route('/getCategories').post((req, res) => {
    PrizesCategory.aggregate([
      {
        $match :{
          "inMyBag.isInMyBag" : true
        }, 
      },
      {
        $sort : {
          "inMyBag.order" : 1
        }
      }, 
      {
        $project : {
          title : 1
        }
      }
    ])
    .then(categories => res.json(categories))
    .catch(err => {res.status(400).send((err).toString())});
});

router.route('/setActifItem').post((req, res) => {
    const idBroadcaster    = req.body.idBroadcaster;
    const idCategory    = req.body.idCategory;
    const idItem    = req.body.idItem;
    const status   = req.body.status;

    MyBag.updateOne({
        idBroadcaster : ObjectId(idBroadcaster), 
        prizes : {
            $elemMatch : {
                status : 1,
                idPrizeCat : ObjectId(idCategory),
            }
        } 
    }, 
    {
        $set : {
            "prizes.$.status" : 0
        }
    })
    .then(itemUpdated => {
        if (status == 0) {
            MyBag.updateOne({
                idBroadcaster : ObjectId(idBroadcaster), 
                prizes : {
                    $elemMatch : {
                        _id : ObjectId(idItem),
                        idPrizeCat : ObjectId(idCategory),
                    }
                } 
            }, 
            {
                $set : {
                    "prizes.$.status" : 1
                }
            })
            .then(itemSelected => res.json({itemUpdated, itemSelected}))
            .catch(err => {res.status(400).send((err).toString())});
        }
        else {
            res.json({updated : 'true'});
        }
       
    })
    .catch(err => {res.status(400).send((err).toString())});
});


router.route('/insertPrizeCat').post((req, res) => {
        

    PrizesCategory.insertMany(bagCat)
    .then(req => { 
            const r = {error: false, message : 'REQUESTS_SENDED' };
            res.json(r);
            }
    )
    .catch(err => res.status(400).send((err).toString()));

});

  
module.exports = router;
const router = require('express').Router();

let Level = require('../models/levels.model');
var ObjectId = require('mongoose').Types.ObjectId;


const dd = [
    {
    
        rank : 1,
        expmin : 0,
        expmax : 1000,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
        rank : 2,
        expmin : 1001,
        expmax : 2000,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
    
        rank : 3,
        expmin : 2001,
        expmax : 3000,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 4,
        expmin : 3001,
        expmax : 4000,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
    
        rank : 5,
        expmin : 4001,
        expmax : 5000,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
    
        rank : 6,
        expmin : 5001,
        expmax : 6000,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
    
        rank : 7,
        expmin : 6001,
        expmax : 7000,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 8,
        expmin : 7001,
        expmax : 8000,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 9,
        expmin : 8001,
        expmax : 9000,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 10,
        expmin : 3001,
        expmax : 13500,
        toObtain : [],
        color : "#00e600"
    },
    
    {
    
        rank : 11,
        expmin : 13501,
        expmax : 20250,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
        rank : 12,
        expmin : 20251,
        expmax : 30375,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 13,
        expmin : 30376,
        expmax : 45563,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 14,
        expmin : 45564,
        expmax : 68344,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
    
        rank : 15,
        expmin : 68345,
        expmax : 102516,
        toObtain : [],
        color : "#00e600"
    },
    
    {
    
        rank : 16,
        expmin : 102516,
        expmax : 153773,
        toObtain : [],
        color : "#00e600"
    },
    
    {
    
        rank : 17,
        expmin : 153774,
        expmax : 230660,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 18,
        expmin : 230661,
        expmax : 345990,
        toObtain : [],
        color : "#00e600"
    },
    
    {
        rank : 19,
        expmin : 345991,
        expmax : 518985,
        toObtain : [],
        color : "#00e600"
    },
    
    
    {
        rank : 20,
        expmin : 518985,
        expmax : 570884,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 21,
        expmin : 570885,
        expmax : 627972,
        toObtain : [],
        color : "#16a9fe"
    },
    
    
    {
        rank : 22,
        expmin : 627973,
        expmax : 690770,
        toObtain : [],
        color : "#16a9fe"
    },
    
    
    {
    
        rank : 23,
        expmin : 690771,
        expmax : 759846,
        toObtain : [],
        color : "#16a9fe"
    },
    
    
    {
    
        rank : 24,
        expmin : 759847,
        expmax : 835831,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
    
        rank : 25,
        expmin : 835832,
        expmax : 919414,
        toObtain : [],
        color : "#16a9fe"
    },
    {
    
        rank : 26,
        expmin : 919415,
        expmax : 1011356,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 27,
        expmin : 1011357,
        expmax : 1112491,
        toObtain : [],
        color : "#16a9fe"
    },
    
    
    {
        rank : 28,
        expmin : 1112492,
        expmax : 1223740,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 29,
        expmin : 1223741,
        expmax : 1346114,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 30,
        expmin : 1346115,
        expmax : 1480726,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
    
        rank : 31,
        expmin : 1480727,
        expmax : 1628798,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 32,
        expmin : 1628799,
        expmax : 1791678,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 33,
        expmin : 1791679,
        expmax : 1970846,
        toObtain : [],
        color : "#16a9fe"
    },
    {
        rank : 34,
        expmin : 1970847,
        expmax : 2167931,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 35,
        expmin : 2167932,
        expmax : 2384724,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 36,
        expmin : 2384725,
        expmax : 2623196,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 37,
        expmin : 2623197,
        expmax : 2885516,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 38,
        expmin : 2885517,
        expmax : 3174067,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 39,
        expmin : 3174068,
        expmax : 3491474,
        toObtain : [],
        color : "#16a9fe"
    },
    
    {
        rank : 40,
        expmin : 3491475,
        expmax : 3840621,
        toObtain : [],
        color : "#6a01c6"
    },
    
    {
        rank : 41,
        expmin : 3840622,
        expmax : 4224683,
        toObtain : [],
        color : "#6a01c6"
    },
    
    
    {
        rank : 42,
        expmin : 4224684,
        expmax : 4647152,
        toObtain : [],
        color : "#6a01c6"
    },
    
    
    {
        rank : 43,
        expmin : 4647153,
        expmax : 5111867,
        toObtain : [],
        color : "#6a01c6"
    },
    
    
    {
        rank : 44,
        expmin : 5111868,
        expmax : 5623054,
        toObtain : [],
        color : "#6a01c6"
    },
    
    
    {
        rank : 45,
        expmin : 5623055,
        expmax : 6185359,
        toObtain : [],
        color : "#6a01c6"
    },
    
    {
        rank : 46,
        expmin : 6185360,
        expmax : 5803895,
        toObtain : [],
        color : "#6a01c6"
    },
    
    {
        rank : 47,
        expmin : 5803896,
        expmax : 7484284,
        toObtain : [],
        color : "#6a01c6"
    },
    
    {
        rank : 48,
        expmin : 7484285,
        expmax : 8232713,
        toObtain : [],
        color : "#6a01c6"
    },
    
    
    {
        rank : 49,
        expmin : 8232714,
        expmax : 9055984,
        toObtain : [],
        color : "#6a01c6"
    },
    
    
    {
    
        rank : 50,
        expmin : 9055985,
        expmax : 9961583,
        toObtain : [],
        color : "#6a01c6"
    }
    ];

    const lev02 = [
        {
            "rank" : 51,
            "expmin" : 9961584,
            "expmax" : 10957741,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        {
        
            "rank" : 52,
            "expmin" : 10957742,
            "expmax" : 12053515,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        
        {
            "rank" : 53,
            "expmin" : 12053516,
            "expmax" : 13258866,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        {
            "rank" : 54,
            "expmin" : 13258867,
            "expmax" : 14584753,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        
        {
            "rank" : 55,
            "expmin" : 14584754,
            "expmax" : 16043228,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        {
            "rank" : 56,
            "expmin" : 16043229,
            "expmax" : 17647551,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        
        {
            "rank" : 57,
            "expmin" : 17647552,
            "expmax" : 19412306,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        
        {
            "rank" : 58,
            "expmin" : 19412307,
            "expmax" : 21353537,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        
        {
            "rank" : 59,
            "expmin" : 21353538,
            "expmax" : 23488891,
            "toObtain" : [],
            "color" : "#6a01c6"
        },
        
        {
            "rank" : 60,
            "expmin" : 23488892,
            "expmax" : 25837780,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 61,
            "expmin" : 25837781,
            "expmax" : 28421558,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 62,
            "expmin" : 28421559,
            "expmax" : 31263713,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
        
            "rank" : 63,
            "expmin" : 31263714,
            "expmax" : 34390085,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 64,
            "expmin" : 34390086,
            "expmax" : 37829093,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 65,
            "expmin" : 37829094,
            "expmax" : 41612003,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 66,
            "expmin" : 41612004,
            "expmax" : 45773203,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        
        {
            "rank" : 67,
            "expmin" : 45773204,
            "expmax" : 50350523,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        
        {
            "rank" : 68,
            "expmin" : 50350524,
            "expmax" : 55385576,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 69,
            "expmin" : 55385577,
            "expmax" : 60924133,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
        
            "rank" : 70,
            "expmin" : 60924134,
            "expmax" : 67016546,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        
        {
            "rank" : 71,
            "expmin" : 67016547,
            "expmax" : 73718201,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 72,
            "expmin" : 73718202,
            "expmax" : 81090021,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 73,
            "expmin" : 81090022,
            "expmax" : 89199023,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
        
            "rank" : 74,
            "expmin" : 89199024,
            "expmax" : 98118926,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 75,
            "expmin" : 98118927,
            "expmax" : 107930818,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 76,
            "expmin" : 107930819,
            "expmax" : 118723900,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 77,
            "expmin" : 118723901,
            "expmax" : 130596290,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 78,
            "expmin" : 130596291,
            "expmax" : 143655919,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 79,
            "expmin" : 143655920,
            "expmax" : 158021511,
            "toObtain" : [],
            "color" : "#f56a00"
        },
        
        {
            "rank" : 80,
            "expmin" : 158021512,
            "expmax" : 173823662,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 81,
            "expmin" : 173823663,
            "expmax" : 191206028,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 82,
            "expmin" : 191206029,
            "expmax" : 210326631,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 83,
            "expmin" : 210326632,
            "expmax" : 231359294,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 84,
            "expmin" : 231359295,
            "expmax" : 254495223,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
        
            "rank" : 85,
            "expmin" : 254495224,
            "expmax" : 279944746,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 86,
            "expmin" : 279944747,
            "expmax" : 307939220,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 87,
            "expmin" : 307939221,
            "expmax" : 338733142,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 88,
            "expmin" : 338733143,
            "expmax" : 372606456,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 89,
            "expmin" : 372606457,
            "expmax" : 409867102,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 90,
            "expmin" : 409867103,
            "expmax" : 450853812,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 91,
            "expmin" : 450853813,
            "expmax" : 495939193,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 92,
            "expmin" : 495939194,
            "expmax" : 545533113,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 93,
            "expmin" : 545533114,
            "expmax" : 600086424,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 94,
            "expmin" : 600086425,
            "expmax" : 660095066,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 95,
            "expmin" : 660095067,
            "expmax" : 726104573,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 96,
            "expmin" : 726104574,
            "expmax" : 798715030,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 97,
            "expmin" : 798715031,
            "expmax" : 878586533,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 98,
            "expmin" : 878586534,
            "expmax" : 966445187,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        {
            "rank" : 99,
            "expmin" : 966445188,
            "expmax" : 1063089706,
            "toObtain" : [],
            "color" : "#f50000"
        },
        
        
        {
            "rank" : 100,
            "expmin" : 1063089707,
            "expmax" : 1169398676,
            "toObtain" : [],
            "color" : "#f000ec"
        }
    ];

    const lev03 = [
        
{
    "rank" : 101,
    "expmin" : 1169398677,
    "expmax" : 1286338544,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 102,
    "expmin" : 1286338545,
    "expmax" : 1414972398,
    "toObtain" : [],
    "color" : "#f000ec"
},

{

    "rank" : 103,
    "expmin" : 1414972399,
    "expmax" : 1556469638,
    "toObtain" : [],
    "color" : "#f000ec"
},

{

    "rank" : 104,
    "expmin" : 1556469639,
    "expmax" : 1712116602,
    "toObtain" : [],
    "color" : "#f000ec"
},


{

    "rank" : 105,
    "expmin" : 1712116603,
    "expmax" : 1883328262,
    "toObtain" : [],
    "color" : "#f000ec"
},

{

    "rank" : 106,
    "expmin" : 1883328263,
    "expmax" : 2071661088,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 107,
    "expmin" : 2071661089,
    "expmax" : 2278827197.0,
    "toObtain" : [],
    "color" : "#f000ec"
},

{
    "rank" : 108,
    "expmin" : 2278827198.0,
    "expmax" : 2506709916.0,
    "toObtain" : [],
    "color" : "#f000ec"
},

{
    "rank" : 109,
    "expmin" : 2506709917.0,
    "expmax" : 2757380908.0,
    "toObtain" : [],
    "color" : "#f000ec"
},

{
    "rank" : 110,
    "expmin" : 2757380909.0,
    "expmax" : 3033118999.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 111,
    "expmin" : 3033119000.0,
    "expmax" : 3336430899.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 112,
    "expmin" : 3336430900.0,
    "expmax" : 3670073989.0,
    "toObtain" : [],
    "color" : "#f000ec"
},

{
    "rank" : 113,
    "expmin" : 3670073990.0,
    "expmax" : 4037081388.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 114,
    "expmin" : 4037081389.0,
    "expmax" : 4440789526.0,
    "toObtain" : [],
    "color" : "#f000ec"
},

{
    "rank" : 115,
    "expmin" : 4440789527.0,
    "expmax" : 4884868479.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 116,
    "expmin" : 4884868480.0,
    "expmax" : 5373355327.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 117,
    "expmin" : 5373355328.0,
    "expmax" : 5910690859.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 118,
    "expmin" : 5910690860.0,
    "expmax" : 6501759945.0,
    "toObtain" : [],
    "color" : "#f000ec"
},


{
    "rank" : 119,
    "expmin" : 6501759946.0,
    "expmax" : 7151935940.0,
    "toObtain" : [],
    "color" : "#f000ec"
},

{
    "rank" : 120,
    "expmin" : 7151935941.0,
    "expmax" : 7867129534.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 121,
    "expmin" : 7867129535.0,
    "expmax" : 8653842487.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 122,
    "expmin" : 8653842488.0,
    "expmax" : 9519226736.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 123,
    "expmin" : 9519226737.0,
    "expmax" : 10471149410.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 124,
    "expmin" : 10471149411.0,
    "expmax" : 11518264351.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 125,
    "expmin" : 11518264352.0,
    "expmax" : 12670090786.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 126,
    "expmin" : 12670090787.0,
    "expmax" : 13937099864.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 127,
    "expmin" : 13937099865.0,
    "expmax" : 15330809851.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 128,
    "expmin" : 15330809852.0,
    "expmax" : 16863890836.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 129,
    "expmin" : 16863890837.0,
    "expmax" : 18550279919.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 130,
    "expmin" : 18550279920.0,
    "expmax" : 20405307911.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 131,
    "expmin" : 20405307912.0,
    "expmax" : 22445838702.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 132,
    "expmin" : 22445838703.0,
    "expmax" : 24690422573.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 133,
    "expmin" : 24690422574.0,
    "expmax" : 27159464830.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 134,
    "expmin" : 27159464831.0,
    "expmax" : 29875411313.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 135,
    "expmin" : 29875411314.0,
    "expmax" : 32862952444.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 136,
    "expmin" : 32862952445.0,
    "expmax" : 36149247689.0,
    "toObtain" : [],
    "color" : "#ada200"
},

{
    "rank" : 137,
    "expmin" : 36149247690.0,
    "expmax" : 39764172457.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 138,
    "expmin" : 39764172458.0,
    "expmax" : 43740589703.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 139,
    "expmin" : 43740589704.0,
    "expmax" : 48114648673.0,
    "toObtain" : [],
    "color" : "#ada200"
},


{
    "rank" : 140,
    "expmin" : 48114648674.0,
    "expmax" : 52926113541.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 141,
    "expmin" : 52926113542.0,
    "expmax" : 58218724895.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 142,
    "expmin" : 58218724896.0,
    "expmax" : 64040597384.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 143,
    "expmin" : 64040597385.0,
    "expmax" : 70444657123.0,
    "toObtain" : [],
    "color" : "#ad005c"
},

{
    "rank" : 144,
    "expmin" : 70444657124.0,
    "expmax" : 77489122835.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 145,
    "expmin" : 77489122836.0,
    "expmax" : 85238035119.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 146,
    "expmin" : 85238035120.0,
    "expmax" : 93761838630.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 147,
    "expmin" : 93761838631.0,
    "expmax" : 103138022493.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 148,
    "expmin" : 103138022494.0,
    "expmax" : 113451824743.0,
    "toObtain" : [],
    "color" : "#ad005c"
},


{
    "rank" : 149,
    "expmin" : 113451824744.0,
    "expmax" : 124797007217.0,
    "toObtain" : [],
    "color" : "#ad005c"
},

{
    "rank" : 150,
    "expmin" : 124797007218.0,
    "expmax" : 137276707939.0,
    "toObtain" : [],
    "color" : "#ad005c"
}
    ];


    router.route('/insertLevels').post((req, res) => {
        

        Level.insertMany(lev03)
        .then(req => { 
                const r = {error: false, message : 'REQUESTS_SENDED' };
                res.json(r);
                }
        )
        .catch(err => res.status(400).send((err).toString()));
    
    });


router.route('/addLevel').post((req, res) => {

    var levelObj = new Level({
        rank : req.body.rank,
        expmin : req.body.min,
        expmax : req.body.max,
    });

    levelObj.save()
    .then(levels => res.json(levels) )
    .catch(err => {res.status(400).send((err).toString())});
});



module.exports = router;
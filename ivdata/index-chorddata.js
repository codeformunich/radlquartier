/*jshint node:true */
"use strict";

var program = require('commander');

// load commandline arguments
// program.parse(process.argv);
// var arg = program.args[0].split('.')[0];

// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/infovis';


// Amalienburgsraße 341048
// Eingang TU München 514336
// Hochschule München 360524
// Klinikum Großhadern 341092
// Lehel 683286
// Leopoldstr. vor der Mensa 567173
// Technische Universität München 341155
// Universität 341156




var stationUids = [341048, 514336, 360524, 341092, 683286, 567173, 341155, 341156];
// var dataMatrix = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0]
// ];
var dataMatrix = [
  [ 0, 44, 0, 666, 94, 8, 0, 971, 922 ],
  [ 48, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 674, 0, 0, 0, 0, 0, 0, 6, 10 ],
  [ 97, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 8, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 982, 0, 0, 7, 0, 0, 0, 0, 54 ],
  [ 913, 0, 0, 13, 0, 0, 0, 62, 0 ] 
];

var localIndex = 0;
var indexCount = 0;

var distinctBikeNumbers = function(db, callback) {
    console.log("distinctBikeNumbers");
    db.collection('places').distinct("bike_numbers", { "bike": 1 }, function(err, docs) {
        docs.sort(function(a, b) {
            return a - b;
        });

        // console.log(docs);
        callback(docs);
    });
};


var createForAllBikes = function(db, bikes, index, callback) {
    
    var length = bikes.length;

    console.log('createForAllBikes length: ', length);

    // for (; index <= length; index++) {
        console.log('createForAllBikes index: ', index);
        createChordDataSets(db, bikes[index], function(result) {
            index = index + 1;
            if ( index < length ) {
                createForAllBikes(db, bikes, index, callback);
            }
            else {
                callback(result);
            }
            // localIndex = localIndex + 1;
            // // console.log('createForAllBikes localIndex: ', localIndex);
            // // console.log('createForAllBikes index: ', index);
            // if (localIndex === length) {
            //     callback(result);
            // }
        });
    // }
};

var createChordDataSets = function(db, bike, callback) {
    console.log('createChordDataSets, bike: ', bike);
    if (bike === null || bike === undefined) {
        return;
    }

    var previousUid = null,
        cursor;
//         dataMatrix = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0]
// ];

    console.log('createChordDataSets, bike: ', bike);

    cursor = db.collection('places')
        .find({ "bike_numbers": bike })
        .sort({ "date": 1 })
        .addCursorFlag('noCursorTimeout', true);
    cursor.each(function(err, place) {
        assert.equal(err, null);
        if (place !== null) {
            // console.log('createChordDataSets, place for bike: ', bike);
            // console.log(place.name);

            var currentIndex = stationUids.indexOf(place.uid) + 1;
            var previousIndex = stationUids.indexOf(previousUid) + 1;
            
            // if (currentIndex > 0) {
            //     console.log('createChordDataSets, currentIndex: ', currentIndex);
            // }

            if (currentIndex != previousIndex) {
                dataMatrix[currentIndex][previousIndex] += 1;
            }
            previousUid = place.uid;
        } else {
            console.log('createChordDataSets, dataMatrix for bike: ', bike);
            console.log(dataMatrix);
            callback(dataMatrix);
        }
    });
};

var insertData = function(db, data, callback) {
    console.log('insertMapDatas, data.length: ', data.length);
    // console.log(data);

    db.collection('mapdatasets').insertMany(data, function(err, result) {
        assert.equal(null, err);

        // console.log('Inserted data into mapdatasets collection');
        callback(result);
    });
};

MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

    // // create chord data for the bike with the bike_number 96111
    // createChordDataSets(db, 96300, function(result) {
    //     db.close();
    //     console.log(result);
    // });

    // // test with a view bikes
    // var test = [96028,96108];
    // createForAllBikes(db, test, indexCount, function(result) {
    //     console.log('... work done.');
    //     db.close();
    //     console.log(result);
    // });

    // // return bike numbers
    // distinctBikeNumbers(db, function(allBikeNumbers) {
    //     console.log('... work done.');
    //     db.close();
    //     console.log(JSON.stringify(allBikeNumbers, null, '\t'));
    // });

    createForAllBikes(db, remainingBikes, indexCount, function(result) {
        console.log('... work done.');
        db.close();
        console.log(result);
    });

    // // create chord data for all bikes
    // distinctBikeNumbers(db, function(allBikeNumbers) {
    //     var bikes = allBikeNumbers;
    //     createForAllBikes(db, bikes, indexCount, function(result) {
    //         console.log('... work done.');
    //         db.close();
    //         console.log(result);
    //     });
    // });
});

var remainingBikes = [
    96770,
    96772,
    96773,
    96775,
    96777,
    96778,
    96779,
    96780,
    96781,
    96782,
    96783,
    96784,
    96785,
    96786,
    96787,
    96788,
    96789,
    96790,
    96791,
    96792,
    96793,
    96794,
    96795,
    96796,
    96797,
    96798,
    96799,
    96801,
    96802,
    96803,
    96804,
    96805,
    96806,
    96807,
    96808,
    96809,
    96810,
    96811,
    96812,
    96813,
    96814,
    96815,
    96816,
    96817,
    96818,
    96819,
    96820,
    96821,
    96822,
    96823,
    96824,
    96825,
    96826,
    96827,
    96828,
    96829,
    96830,
    96831,
    96832,
    96833,
    96834,
    96835,
    96836,
    96837,
    96838,
    96839,
    96840,
    96841,
    96842,
    96843,
    96844,
    96845,
    96846,
    96847,
    96848,
    96849,
    96850,
    96851,
    96852,
    96853,
    96854,
    96855,
    96856,
    96857,
    96858,
    96859,
    96860,
    96861,
    96862,
    96863,
    96864,
    96865,
    96866,
    96867,
    96868,
    96869,
    96870,
    96871,
    96872,
    96873,
    96874,
    96875,
    96876,
    96877,
    96878,
    96879,
    96880,
    96881,
    96882,
    96883,
    96884,
    96885,
    96886,
    96887,
    96888,
    96889,
    96890,
    96891,
    96892,
    96893,
    96894,
    96895,
    96896,
    96897,
    96898,
    96900,
    96901,
    96902,
    96904,
    96906,
    96907,
    96908,
    96909,
    96910,
    96911,
    96912,
    96913,
    96914,
    96915,
    96916,
    96917,
    96918,
    96919,
    96920,
    96921,
    96922,
    96923,
    96924,
    96925,
    96926,
    96927,
    96928,
    96929,
    96930,
    96931,
    96932,
    96933,
    96934,
    96935,
    96936,
    96937,
    96938,
    96940,
    96941,
    96942,
    96943,
    96944,
    96945,
    96946,
    96947,
    96948,
    96949,
    96950,
    96951,
    96952,
    96953,
    96954,
    96955,
    96956,
    96957,
    96958,
    96959,
    96960,
    96961,
    96962,
    96963,
    96964,
    96965,
    96966,
    96967,
    96968,
    96969,
    96970,
    96971,
    96972,
    96973,
    96974,
    96975,
    96976,
    96977,
    96978,
    96979,
    96980,
    96981,
    96982,
    96983,
    96984,
    96985,
    96986,
    96987,
    96988,
    96989,
    96990,
    96991,
    96992,
    96993,
    96994,
    96995,
    96996,
    96997,
    96998,
    96999,
    97000,
    97001,
    97002,
    97003,
    97004,
    97005,
    97006,
    97007,
    97008,
    97009,
    97010,
    97011,
    97012,
    97013,
    97014,
    97015,
    97016,
    97017,
    97018,
    97019,
    97020,
    97021,
    97022,
    97023,
    97024,
    97025,
    97026,
    97027,
    97028,
    97029,
    97030,
    97031,
    97032,
    97033,
    97034,
    97035,
    97036,
    97037,
    97038,
    97039,
    97040,
    97041,
    97042,
    97043,
    97044,
    97045,
    97046,
    97047,
    97048,
    97049,
    97050,
    97051,
    97052,
    97053,
    97054,
    97055,
    97056,
    97057,
    97058,
    97059,
    97060,
    97061,
    97062,
    97063,
    97064,
    97065,
    97066,
    97067,
    97068,
    97069,
    97070,
    97071,
    97072,
    97073,
    97074,
    97075,
    97076,
    97077,
    97078,
    97079,
    97080,
    97081,
    97082,
    97083,
    97084,
    97085,
    97086,
    97087,
    97088,
    97089,
    97090,
    97091,
    97092,
    97093,
    97094,
    97095,
    97096,
    97097,
    97098,
    97099,
    97100,
    97101,
    97102,
    97103,
    97104,
    97106,
    97107,
    97108,
    97109,
    97110,
    97111,
    97112,
    97113,
    97114,
    97115,
    97116,
    97117,
    97118,
    97119,
    97120,
    97121,
    97122,
    97123,
    97124,
    97125,
    97126,
    97127,
    97128,
    97129,
    97130,
    97131,
    97132,
    97133,
    97134,
    97135,
    97136,
    97137,
    97138,
    97139,
    97140,
    97141,
    97142,
    97143,
    97144,
    97145,
    97146,
    97147,
    97148,
    97150,
    97151,
    97152,
    97153,
    97154,
    97155,
    97156,
    97157,
    97158,
    97159,
    97160,
    97161,
    97162,
    97163,
    97164,
    97165,
    97166,
    97167,
    97168,
    97169,
    97170,
    97171,
    97172,
    97173,
    97174,
    97175,
    97176,
    97177,
    97178,
    97179,
    97180,
    97181,
    97182,
    97183,
    97184,
    97185,
    97186,
    97187,
    97188,
    97189,
    97190,
    97191,
    97192,
    97193,
    97194,
    97195,
    97196,
    97197,
    97198,
    97199,
    97200,
    97201,
    97202,
    97203,
    97204,
    97205,
    97206,
    97207,
    97208,
    97209,
    97210,
    97211,
    97212,
    97213,
    97214,
    97215,
    97216,
    97217,
    97218,
    97220,
    97221,
    97222,
    97223,
    97224,
    97225,
    97226,
    97227,
    97228,
    97229,
    97230,
    97231,
    97232,
    97233,
    97234,
    97235,
    97236,
    97237,
    97238,
    97239,
    97240,
    97241,
    97242,
    97243,
    97244,
    97245,
    97246,
    97247,
    97248,
    97249,
    97250,
    97251,
    97252,
    97253,
    97254,
    97255,
    97256,
    97257,
    97258,
    97259,
    97260,
    97261,
    97262,
    97263,
    97264,
    97265,
    97266,
    97267,
    97268,
    97269,
    97270,
    97271,
    97272,
    97273,
    97274,
    97275,
    97276,
    97277,
    97278,
    97279,
    97280,
    97281,
    97282,
    97283,
    97284,
    97285,
    97286,
    97287,
    97288,
    97289,
    97290,
    97291,
    97292,
    97293,
    97294,
    97295,
    97296,
    97297,
    97298,
    97299,
    97300,
    97301,
    97302,
    97303,
    97305,
    97308,
    97309,
    97310,
    97311,
    97312,
    97313,
    97314,
    97315,
    97316,
    97317,
    97318,
    97319,
    97320,
    97321,
    97322,
    97323,
    97324,
    97325,
    97326,
    97327,
    97328,
    97329,
    97330,
    97332,
    97333,
    97334,
    97335,
    97336,
    97337,
    97338,
    97339,
    97340,
    97341,
    97342,
    97343,
    97344,
    97345,
    97346,
    97347,
    99990
];

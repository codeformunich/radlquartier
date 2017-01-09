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
var dataMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];


var distinctBikeNumbers = function(db, callback) {
    db.collection('places').distinct("bike_numbers", { "bike": 1 }, function(err, docs) {
        // console.log("distinctBikeNumbers, docs: ", docs);
        docs.sort(function(a, b) {
            return a - b;
        });

        // console.log(docs);
        callback(docs);
    });
};

// var createForAllBikes = function(db, bikeNumbers, callback) {
//     var bike = 0,
//         length = bikeNumbers.length;

//     console.log('createForAllBikes length: ', length);

//     for (; bike <= length; bike++) {
//         createMapDataSets(db, bikeNumbers[bike], function(result) {
//             if (bike === length) {
//                 callback();
//             }
//         });
//     }
// };

var createChordDataSets = function(db, bike, callback) {
    if (bike === null || bike === undefined) {
        return;
    }

    console.log('createMapDataSets, bike: ', bike);

    // var previousPlace = null;
    var mapDatas = [];
    var mapData = null;
    // var bike = 97346;
    // var count =0;

    var previousUid = null;

    var cursor = db.collection('places')
        .find({ "bike_numbers": bike })
        .sort({ "date": 1 })
        .addCursorFlag('noCursorTimeout', true);
    cursor.each(function(err, place) {
        assert.equal(err, null);
        if (place !== null) {

            var currentIndex = stationUids.indexOf(place.uid) + 1;
            var previousIndex = stationUids.indexOf(previousUid) + 1;
            
            if (currentIndex != previousIndex) {
                dataMatrix[currentIndex][previousIndex] += 1;
            }
            previousUid = place.uid;
        } else {
            callback(dataMatrix);
        }
    });
};

var createMapData = function(bike, place) {
    var mapData = {};

    mapData.bike = bike;
    mapData.coordinates = [place.lng, place.lat];
    mapData.date = place.date;
    mapData.count = 0;

    console.log('createMapData, mapData: ', mapData.bike, mapData.coordinates);
    return mapData;
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

    // create chord data for the bike with the bike_number 96111
    createChordDataSets(db, 96111, function(result) {
        db.close();
        console.log(result);
    });

    // creare map data for all bikes
    // distinctBikeNumbers(db, function(allBikeNumbers) {
    //     createForAllBikes(db, allBikeNumbers, function() {
    //         db.close();
    //         console.log('... work done.');
    //     });
    // });
});

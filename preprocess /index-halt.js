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

var url = 'mongodb://localhost:27017/bikeproject';
var inputCollection = 'placesfebruar';
var outputCollection = 'bikeLocationFebruar';

var distinctBikeNumbers = function(db, callback) {
    db.collection(inputCollection).distinct( "bike_numbers", { "bike": 1 }, function(err, docs) {
        // console.log("distinctBikeNumbers, docs: ", docs);
        docs.sort(function(a, b) {
            return a-b;
        });

        // console.log(docs);
        callback(docs);
    } );
};

var createForAllBikes = function(db, bikeNumbers, callback) {
    var bike = 0,
        length = bikeNumbers.length;

    console.log('createForAllBikes length: ', length);

    for (; bike <= length; bike++) {
        createMapDataSets(db, bikeNumbers[bike], function(result) {
            if (bike === length) {
                callback();
            }
        });
    }
};

var createMapDataSets = function(db, bike, callback) {
    if ( bike === null || bike === undefined ) {
        return;
    }

    console.log('createMapDataSets, bike: ', bike);

    // var previousPlace = null;
    var mapDatas = [];
    var mapData = null;
    // var bike = 97346;
    // var count =0;

    var cursor = db.collection(inputCollection)
        .find( {"bike_numbers": bike } )
        .sort( {"date": 1} )
        .addCursorFlag('noCursorTimeout', true);
    cursor.each(function(err, place) {
       assert.equal(err, null);
       if (place !== null) {

          // count = count +1;
          // console.log('createMapDataSets, count: ', count);

          if (mapData === null) {
            mapData = createMapData(bike, place);
          }
          
          if (place.lng === mapData.coordinates[0] && place.lat === mapData.coordinates[1]) {
            mapData.endDate = place.date;
            mapData.count = mapData.count + 1;
          }
          else {
            if (mapData) {
                mapDatas.push(mapData);

                mapData = createMapData(bike, place);
            }
          }

       } else {
            //console.log('log else: ', mapData);
            if (mapData) {
                mapDatas.push(mapData);
                // insertMapData(db, mapData);
            }

            insertData(db, mapDatas, function(result) {
                console.log(result.insertedCount);
                callback(result);
            });
       }
    });
};

var createMapData = function( bike, place) {
    var mapData = {};

    mapData.bike = bike;
    mapData.coordinates =  [place.lng, place.lat];
    mapData.startDate = place.date;
    mapData.endDate = place.date;
    mapData.count = 0;

    if (place.spot) {
        mapData.stationId = place.uid;
        mapData.stationName = place.name;
    }

    console.log('createMapData, mapData: ', mapData.bike, mapData.coordinates);
    return mapData;
};

var insertData = function(db, data, callback) {
    console.log('insertMapDatas, data.length: ', data.length);
    // console.log(data);

    db.collection(outputCollection).insertMany( data, function(err, result) {
        assert.equal(null, err);
        
        // console.log('Inserted data into mapdatasets collection');
        callback(result);
    });
};

MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

    // // create map data for the bike with the bike_number 97252
    // createMapDataSets(db, 97252, function() {
    //     db.close();
    // } );

    // creare map data for all bikes
    distinctBikeNumbers(db, function(allBikeNumbers) {
        createForAllBikes(db, allBikeNumbers, function() {
            db.close();
            console.log('... work done.');
        });
    });
});
"use strict";

// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var db;

var url = 'mongodb://localhost:27017/bikeproject'; 
var ridesCollection = 'rides'; //'testrides';
var bikeCollection =  'mnsbike'; 


var callbackCount = 0;

MongoClient.connect(url, function(err, tempDb) {
  assert.equal(err, null);

  db = tempDb;
});


process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var json,
        timeStamp;

    json = JSON.parse(input);
    // console.log(input);
    // console.log(json);

    timeStamp = json.addedBikes[0].updated;
    if (timeStamp === null) {
        console.log('ERROR, process.stdin.on(end, timeStamp: null');
        return;
    }
    console.log( 'timeStamp:', timeStamp);

    var bikes = json.addedBikes;
    var stations = json.addedStations;
    var bikeCount = bikes.length;
    for (var i = 0; i < bikeCount; i++) {
        var bikeState = bikes[i];

        
        if (checkForBike(bikeState)) {
            updateBike(biekState);
        }
        else {
            createBike(bikeState);
        }

        var halt = findLastHalt(bikeState);
        if(halt !== null) {
            if(halt.coordinates[0] === bikeState.longitude && halt.coordinates[1] === bikeState.latitude ) {
                updateHalt(bikeState);
            }
            else {
               createRide(halt, bikeState);
               createHalt(bikeState);
            }
        }
        else {
            createHalt(bikeState);
        }        
    }
});




////////////////////////////////////
//
// helper functions for new objects
//
////////////////////////////////////
var newBike = function(bikeState) {
    var bike = {};

    bike.bikeNumber = bikeState.bikeNumber;
    bike.firstAppearanceDate = new Date(bikeState.updated);
    bike.lastAppearanceDate = new Date(bikeState.updated);

    console.log('newBike, bikeNumber:', bike.bikeNumber);
    return bike;
};

var checkforBike = function(bikeState) {

    return false;
};

var 


var insertMetaData = function(db, json, timeStamp, callback) {
    callbackCount = callbackCount + 1;
    console.log( 'insertMetaData, callbackCount:', callbackCount);
    
    var metaData = newMetaData(json, timeStamp);
    
    db.collection(metaDataCollection).insertOne(metaData, function(err, result) {
        assert.equal(err, null);
        callback();
    });
};

var insertBikes = function(db, json, timeStamp, callback) {
    callbackCount = callbackCount + 1;
    console.log( 'insertBikes, callbackCount:', callbackCount);

    var bikes = json.addedBikes;
    db.collection(bikeCollection).insertMany(bikes, function(err, result) {
        assert.equal(null, err);
        callback();
    });
};

var insertStations = function(db, json, timeStamp, callback) {
    callbackCount = callbackCount + 1;
    console.log( 'insertStations, callbackCount:', callbackCount);

    var stations = json.addedStations;
    var stationCount = stations.length;
    for (var i = 0; i < stationCount; i++) {
        stations[i].timeStamp = timeStamp;
    }

    db.collection(stationCollection).insertMany(stations, function(err, result) {
        assert.equal(null, err);
        callback();
    }); 
};

var newMetaData = function(json, timeStamp) {
    var metaData = {};
    metaData.timeStamp = timeStamp;
    metaData.addedBikes = json.addedBikes.length;
    metaData.changedBikes = json.changedBikes.length;
    metaData.deletedBikes = json.deletedBikes.length;
    metaData.addedStations = json.addedStations.length;
    metaData.changedStations = json.changedStations.length;
    metaData.deletedStations = json.deletedStations.length;

    console.log( 'newMetaData, metaData:', metaData);
    return metaData;
};

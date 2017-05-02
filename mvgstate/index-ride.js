/*jshint node:true */
"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var citys,
        cityCount,
        json,
        places;
/*jshint node:true */
"use strict";

// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/bikeproject'; 
var ridesCollection = 'rides'; //'testrides'

var callbackCount = 0;

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

    MongoClient.connect(url, function(err, db) {
        assert.equal(err, null);

        insertMetaData(db, json, timeStamp, function() {
            console.log( 'insertMetaDataCallback, callbackCount:', callbackCount);
            callbackCount = callbackCount - 1;
    
            if (callbackCount === 0) {
                db.close();
                console.log('... work done.');
            }
        });

        insertBikes(db, json, timeStamp, function() {
            console.log( 'insertMetaDataCallback, callbackCount:', callbackCount);
            callbackCount = callbackCount - 1;
    
            if (callbackCount === 0) {
                db.close();
                console.log('... work done.');
            }
        });

        insertStations(db, json, timeStamp, function() {
            console.log( 'insertMetaDataCallback, callbackCount:', callbackCount);
            callbackCount = callbackCount - 1;
    
            if (callbackCount === 0) {
                db.close();
                console.log('... work done.');
            }
        });
    }); 
});

var closeConnection = function(db) {
    console.log( 'closeConnection, callbackCount:', callbackCount);
    callbackCount = callbackCount - 1;
    
    if (callbackCount === 0) {
        db.close();
        console.log('... work done.');
    }
};

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

    json = JSON.parse(input);
    // console.log(input);
    // console.log(json);

    citys = json.markers.country.city;
    
    if( citys.constructor === Array ) {
        cityCount = citys.length;
        // console.log(citys[0].name);
        // console.log(cityCount);

        for (var i = 0; i < cityCount; i++) {
            if (citys[i].name === 'München') {
                // console.log(json.markers.country.city[i]);
                places = citys[i].place;
            }
        }    
    }
    else {
        // console.log(citys.name);
        places = citys.place;
    }

    console.log(JSON.stringify(places, null, '\t'));
});
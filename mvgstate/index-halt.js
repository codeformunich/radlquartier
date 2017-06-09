/*jshint node:true */
"use strict";

// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/bikeproject'; 
var metaDataCollection = 'mnsmeta';
// var bikeCollection =  'mnsbike'; //'testcollection';
// var stationCollection =  'mnsstation'; //'testcollection';

// var ridesCollection = 'rides'; // 'testrides'; //
var haltsCollection = 'testhalts'; // 'halts'; // 

var callbackCount = 0;
var bikesCount = 0;

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var json, 
        bikes,  
        index = 0;

    json = JSON.parse(input);
    // console.log(input);
    // console.log(json);

    bikes = json.addedBikes;
    bikesCount = bikes.length;

    MongoClient.connect(url, function(err, db) {
        assert.equal(err, null);

        callbackCount = callbackCount + 1;
        insertMetaData(db, json);

        for (index; index < bikesCount; index++) {
            generateHalt(db, bikes[index], closeCallback);

            //     function() {
            //     console.log( 'generateHaltCallback, callbackCount:', callbackCount);
            //     callbackCount = callbackCount - 1;
    
            //     if (callbackCount === 0) {
            //         db.close();
            //         console.log('... work done.');
            //     }
            // });
        }
    }); 
});

var closeCallback = function(db) {
    if (++callbackCount == bikesCount) {
        console.log( 'closeCallback, callbackCount:', callbackCount);
        db.close();
        console.log('... work done.');
    }
};

var generateHalt = function(db, bike, callback) {
    console.log( 'generateHalt, bike.bikeNumber:', bike.bikeNumber);

    findLastHalt(db, bike, function(docs) {
        if ( docs.length === 0 || docs[0] === null || docs[0] === undefined ){
            insertHalt(db, bike, function() {
                callback(db);
            });
            
            return;
        }

        var lastHalt = docs[0];
        // console.log( 'generateHalt, bike:', bike);
        // console.log( 'generateHalt, lastHalt:', lastHalt);

        // console.log( 'generateHalt:', lastHalt.loc.coordinates[0], bike.longitude, 
        //     lastHalt.loc.coordinates[1], bike.latitude);
        if (lastHalt.loc.coordinates[0] === bike.longitude && lastHalt.loc.coordinates[1] === bike.latitude) {
            updateHalt(db, bike, lastHalt, function() {
                callback(db);
            });
        }
        else {
        //     insertHalt(db, bike, function() {
                callback(db);
        //     });
        }

    });

    
};

var findLastHalt = function(db, bike, callback) {
    console.log( 'findLastHalt, bike.bikeNumber:', bike.bikeNumber);

    db.collection(haltsCollection)
        .find({bikeNumber: bike.bikeNumber})
        .sort({_id:-1})
        .limit(1)
        .toArray(function( err, docs ){
            assert.equal(err, null);
            // console.log( 'findLastHalt, docs:', docs);
            callback(docs);
        }
    );
};

var insertHalt = function(db, bike, callback) {
    var halt= newHalt(bike);
    if (halt === null) {
        console.log('ERROR insertHalt, halt: ', halt);
        return;
    }

    console.log('insertHalt, halt.bikeNumber: ', halt.bikeNumber);
    db.collection(haltsCollection).insertOne( halt, function(err, result) {
        assert.equal(null, err);
        callback(result);
    });
};

var updateHalt = function(db, bike, lastHalt, callback) {
    var date = new Date(bike.updated);

    var halt = lastHalt;
    // console.log('updateHalt, halt: ', halt);
    halt.dates.push(date);
    halt.endDate = date;
    halt.count = halt.count + 1;

    console.log('updateHalt, halt.bikeNumber: ', halt.bikeNumber);
    db.collection(haltsCollection).updateOne({_id: halt._id}, 
        {$set: {dates: halt.dates, endDate: halt.endDate, count: halt.count}}, 
        function(err, result) {
            assert.equal(null, err);
            assert.equal(1, result.matchedCount);
            assert.equal(1, result.modifiedCount);
            callback(result);
        }
    );
};

var closeConnection = function(db) {
    console.log( 'closeConnection, callbackCount:', callbackCount);
    callbackCount = callbackCount - 1;
    
    if (callbackCount === 0) {
        db.close();
        console.log('... work done.');
    }
};


// helper function
// creates new halt object 
var newHalt = function(bike) {
    if (bike === null || bike === undefined ) {
        console.log('ERROR: newHalt, bike:', bike);
        return null;    
    }

    var halt = {};
    var date = new Date(bike.updated);

    halt.bikeNumber = bike.bikeNumber;
    halt.loc = { type: 'Point', coordinates: [bike.longitude, bike.latitude] };
    halt.startDate = date;
    halt.endDate = date;

    halt.count = 1;
    halt.dates = [date];

    if (bike.currentStationID) {
        halt.stationId = bike.currentStationID;        

        // TODO standardize
        //halt.stationId = place.uid;
        //halt.stationName = place.name;
    }

    console.log('newHalt, bikeNumber:', halt.bikeNumber);
    return halt;
};


var insertMetaData = function(db, json, timeStamp, callback) {
    var metaData = newMetaData(json, timeStamp);
    
    db.collection(metaDataCollection).insertOne(metaData, function(err, result) {
        assert.equal(err, null);
    });
};

var newMetaData = function(json) {
    var metaData = {};
    metaData.timeStamp = new Date(json.addedBikes[0].updated);
    metaData.addedBikes = json.addedBikes.length;
    metaData.changedBikes = json.changedBikes.length;
    metaData.deletedBikes = json.deletedBikes.length;
    metaData.addedStations = json.addedStations.length;
    metaData.changedStations = json.changedStations.length;
    metaData.deletedStations = json.deletedStations.length;

    console.log( 'newMetaData, metaData:', metaData);
    return metaData;
};

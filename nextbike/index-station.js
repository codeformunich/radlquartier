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

// had some timeout problems with distinct
// https://stackoverflow.com/questions/39087570/mongodb-timeout-issue-node-js
var url = 'mongodb://localhost:27017/bikeproject?socketTimeoutMS=90000'; 
var inputCollection = 'nextbike'; //'testcollection'; //
var outputCollection = 'stations'; //'teststation'; //

var distinctInputStationUids = function(db, callback) {
    db.collection(inputCollection).distinct( "uid", { "spot": 1 }, function(err, docs) {
        assert.equal(err, null);

        docs.sort(function(a, b) {
            return a-b;
        });

        if ( docs[0] === null ) {
            docs = docs.slice(1, docs.length);
        }

        console.log("distinctInputStationUids, length: ", docs.length);
        callback(docs);
    });
};

var createForAllStationUids = function(db, uids, callback) {
    var bike = 0,
        length = uids.length;

    console.log('createForAllStationUids length: ', length);

    syncLoop(length, function(loop){  
        // console.log('createForAllBikes loop.iteration: ', loop.iteration());
        // console.log('createForAllBikes bikeNumber: ', bikeNumbers[loop.iteration()]);
        createStationData(db, uids[loop.iteration()], function(result) {
            loop.next();
        } );
    }, function(){
        callback();
    });
};

var createStationData = function(db, uid, callback) {
    if ( uid === null || uid === undefined ) {
        console.log('createStationData ERROR, uid: ', uid);
        return;
    }
    console.log('createStationData, uid: ', uid);
    
    var station = newStation(uid);

    findStation(db, uid, function(data) {
        station.number = data.number;
        station.stationName = data.name;
        station.coordinates = [data.lng, data.lat];
        station.bikeRacks = data.bike_racks;

        if ( checkStation(station) ) {
            insertData(db, station, function(result) {
                callback(result);
            });
        }
    });

    aggregateFirstAppearanceDate(db, uid, function(firstAppearance) {
        station.firstAppearanceDate = firstAppearance.date;
        console.log('createStationData, bike.firstAppearanceDate: ', station.firstAppearanceDate);
        
        if ( checkStation(station) ) {
            insertData(db, station, function(result) {
                callback(result);
            });
        }
    });

    aggregateLastAppearanceDate(db, uid, function(lastAppearance) {
        station.lastAppearanceDate = lastAppearance.date;
        console.log('createStationData, bike.lastAppearanceDate: ', station.lastAppearanceDate);
        
        if ( checkStation(station) ) {
            insertData(db, station, function(result) {
                callback(result);
            });
        }
    });
};

// helper function
// creates new bike object 
var newStation = function(uid) {
    

    var station = {};

    station.uid = uid;
    station.number = null;
    station.stationName = null;
    station.coordinates = null;
    station.bikeRacks = null;
    station.firstAppearanceDate = null;
    station.lastAppearanceDate = null;

    console.log('newStation, station:', station.uid);
    return station;
};

var checkStation = function(station) {
    if (station.number === null) {
        return false;
    }

    if (station.stationName === null) {
        return false;
    }

    if (station.coordinates === null) {
        return false;
    }

    if (station.bikeRacks === null) {
        return false;
    }

    if (station.firstAppearanceDate === null) {
        return false;
    }

    if (station.lastAppearanceDate === null) {
        return false;
    }

    return true;
};

var findStation = function(db, uid, callback) {
    console.log('findStation, uid:', uid);
    db.collection(inputCollection).findOne( { uid: uid }, function(err, result) {
        assert.equal(err, null);
        // console.log('findStation, result:', result);
        callback(result);
    }); 
};

var aggregateFirstAppearanceDate = function(db, uid, callback) {
    console.log('aggregateFirstAppearanceDate, uid:', uid);
    db.collection(inputCollection).aggregate( 
        [ 
            { $match: { uid: uid } }, 
            { $group: { _id: {}, date: { $min: "$date" } } } 
        ]).toArray(function(err, result){
            assert.equal(err, null);
            // console.log('aggregateFirstAppearanceDate, result:', result);
            callback(result[0]);
        });
};

var aggregateLastAppearanceDate = function(db, uid, callback) {
    console.log('aggregateLastAppearanceDate, uid:', uid);
    db.collection(inputCollection).aggregate( 
        [
            { $match: { uid: uid } }, 
            { $group: { _id: {}, date: { $max: "$date" } } } 
        ] ).toArray(function(err, result){
            assert.equal(err, null);
            // console.log('aggregateLastAppearanceDate, result:', result);
            callback(result[0]);
        });
};

//helper function
//
var insertData = function(db, data, callback) {
    console.log('insertData, data: ', data);

    db.collection(outputCollection).insertOne( data, function(err, result) {
        assert.equal(null, err);
        callback(result);
    });
};

// https://zackehh.com/handling-synchronous-asynchronous-loops-javascriptnode-js/
function syncLoop(iterations, process, exit){  
    var index = 0,
        done = false,
        shouldExit = false;
    var loop = {
        next:function(){
            if(done){
                if(shouldExit && exit){
                    return exit(); // Exit if we're done
                }
            }
            // If we're not finished
            if(index < iterations){
                index++; // Increment our index
                process(loop); // Run our process, pass in the loop
            // Otherwise we're done
            } else {
                done = true; // Make sure we say we're done
                if(exit) exit(); // Call the callback on exit
            }
        },
        iteration:function(){
            return index - 1; // Return the loop number we're on
        },
        break:function(end){
            done = true; // End the loop
            shouldExit = end; // Passing end as true means we still call the exit callback
        }
    };
    loop.next();
    return loop;
}

MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

    // // create halt data for the bike with the bike_number 97252
    // createMapDataSets(db, 97252, function() {
    //     db.close();
    // } );

    // create halt data for all bikes
    distinctInputStationUids(db, function(allBikeNumbers) {
        createForAllStationUids(db, allBikeNumbers, function() {
            db.close();
            console.log('... work done.');
        });
    });
});
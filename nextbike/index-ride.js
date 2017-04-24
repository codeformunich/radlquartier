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
var inputCollection = 'nextbike'; // 'testcollection'; //
var outputCollection = 'rides'; // 'testride'; //

var distinctBikeNumbers = function(db, callback) {
    db.collection(inputCollection).distinct("bike_numbers", { "bike": 1 }, function(err, docs) {
        assert.equal(err, null);

        docs.sort(function(a, b) {
            return a - b;
        });
        
        docs = docs.filter(function(number) {
            return number !== null;
        });

        // console.log("distinctBikeNumbers, docs: ", docs);
        callback(docs);
    });
};

var createForAllBikes = function(db, bikeNumbers, callback) {
    var bike = 0,
        length = bikeNumbers.length;

    console.log('createForAllBikes length: ', length);

    syncLoop(length, function(loop) {
        // console.log('createForAllBikes loop.iteration: ', loop.iteration());
        // console.log('createForAllBikes bikeNumber: ', bikeNumbers[loop.iteration()]);
        createRideData(db, bikeNumbers[loop.iteration()], function(result) {
            loop.next();
        });
    }, function() {
        callback();
    });
};

var createRideData = function(db, bikeNumber, callback) {
    if (bikeNumber === null || bikeNumber === undefined) {
        console.log('createRideData ERROR, bikeNumber: ', bikeNumber);
        return;
    }
    console.log('createRideData, bike: ', bikeNumber);

    var rides = [];
    var ride = null;

    var cursor = db.collection(inputCollection)
        .find({ "bike_numbers": bikeNumber })
        .sort({ "date": 1 })
        .addCursorFlag('noCursorTimeout', true);

    cursor.each(function(err, place) {
        assert.equal(err, null);
        if (place !== null) {

            if (ride === null) {
                ride = newRide(bikeNumber, place);
            }

            if (place.lng === ride.start.coordinates[0] && place.lat === ride.start.coordinates[1]) {
                ride.start = newLocation(place);
                ride.end = newLocation(place);
            } else {
                if (ride) {
                    ride.end = newLocation(place);

                    rides.push(ride);

                    ride = newRide(bikeNumber, place);
                }
            }

        } else {
            if (ride.start.location != ride.end.location) {
                rides.push(ride);
            }

            if (rides.length > 0) {
                insertData(db, rides, function(result) {
                    callback(result);
                });
            }
            else {
                callback();
            }
        }
    });
};

// helper function
// creates new ride object 
var newRide = function(bikeNumber, place) {
    var ride = {};
    ride.bikeNumber = bikeNumber;
    ride.start = newLocation(place);
    ride.end = newLocation(place);

    console.log('newRide, bikeNumber:', ride.bikeNumber);
    return ride;
};

var newLocation = function(place) {
    var location = {};

    location.coordinates = [place.lng, place.lat];
    location.date = place.date;
    if (place.spot) {
        location.stationId = place.uid;
        location.stationName = place.name;
    }

    return location;
};

//helper function
//
var insertData = function(db, data, callback) {
    console.log('insertData, length: ', data.length);

    db.collection(outputCollection).insertMany(data, function(err, result) {
        assert.equal(null, err);
        callback(result);
    });
};

// https://zackehh.com/handling-synchronous-asynchronous-loops-javascriptnode-js/
function syncLoop(iterations, process, exit) {
    var index = 0,
        done = false,
        shouldExit = false;
    var loop = {
        next: function() {
            if (done) {
                if (shouldExit && exit) {
                    return exit(); // Exit if we're done
                }
            }
            // If we're not finished
            if (index < iterations) {
                index++; // Increment our index
                process(loop); // Run our process, pass in the loop
                // Otherwise we're done
            } else {
                done = true; // Make sure we say we're done
                if (exit) exit(); // Call the callback on exit
            }
        },
        iteration: function() {
            return index - 1; // Return the loop number we're on
        },
        break: function(end) {
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
    distinctBikeNumbers(db, function(allBikeNumbers) {
        createForAllBikes(db, allBikeNumbers, function() {
            db.close();
            console.log('... work done.');
        });
    });
});

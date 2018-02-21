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
var inputCollection =  'nextbike'; //'testcollection';
var outputCollection = 'bikes'; //'testbike';

var distinctInputBikeNumbers = function(db, callback) {
    db.collection(inputCollection).distinct( "bike_numbers", { "bike": 1 }, function(err, docs) {
        assert.equal(err, null);

        docs.sort(function(a, b) {
            return a-b;
        });

        if ( docs[0] === null ) {
            docs = docs.slice(1, docs.length);
        }

        console.log("distinctInputBikeNumbers, length: ", docs.length);
        callback(docs);
    });
};

// var distinctOutputBikeNumbers = function(db, callback) {
//     db.collection(outputCollection).distinct( "bikeNumber", function(err, docs) {
//         assert.equal(err, null);

//         docs.sort(function(a, b) {
//             return a-b;
//         });

//         console.log("distinctOutputBikeNumbers, length: ", docs.length);
//         callback(docs);
//     });
// };

// var checkForNewBikeNumbers = function(inputBikeNumbers, outputBikeNumbers) {
//     var newBikes = inputBikeNumbers.filter(function(bikenumber) {
//         return outputBikeNumbers.indexOf(bikenumber) < 0;
//     });

//     console.log("checkForNewBikeNumbers, length: ", newBikes.length);
//     return newBikes; 
// };

var createForAllBikes = function(db, bikeNumbers, callback) {
    var bike = 0,
        length = bikeNumbers.length;

    console.log('createForAllBikes length: ', length);

    syncLoop(length, function(loop){  
        // console.log('createForAllBikes loop.iteration: ', loop.iteration());
        // console.log('createForAllBikes bikeNumber: ', bikeNumbers[loop.iteration()]);
        createBikeData(db, bikeNumbers[loop.iteration()], function(result) {
            loop.next();
        } );
    }, function(){
        callback();
    });
};

var createBikeData = function(db, bikeNumber, callback) {
    if ( bikeNumber === null || bikeNumber === undefined ) {
        console.log('createBikeData ERROR, bikeNumber: ', bikeNumber);
        return;
    }
    console.log('createBikeData, bike: ', bikeNumber);
    
    var bike = newBike(bikeNumber);

    aggregateFirstAppearanceDate(db, bikeNumber, function(firstAppearance) {
        bike.firstAppearanceDate = firstAppearance.date;
        console.log('createBikeData, bike.firstAppearanceDate: ', bike.firstAppearanceDate);
        
        if ( bike.firstAppearanceDate !== null && bike.lastAppearanceDate !== null ) {
            insertData(db, bike, function(result) {
                callback(result);
            });
        }
    });

    aggregateLastAppearanceDate(db, bikeNumber, function(lastAppearance) {
        bike.lastAppearanceDate = lastAppearance.date;
        console.log('createBikeData, bike.lastAppearanceDate: ', bike.lastAppearanceDate);
        
        if ( bike.firstAppearanceDate !== null && bike.lastAppearanceDate !== null ) {
            insertData(db, bike, function(result) {
                callback(result);
            });
        }
    });
};

// helper function
// creates new bike object 
var newBike = function(bikeNumber) {
    var bike = {};

    bike.bikeNumber = bikeNumber;
    bike.firstAppearanceDate =  null;
    bike.lastAppearanceDate = null;

    console.log('newBike, bikeNumber:', bike.bikeNumber);
    return bike;
};

var aggregateFirstAppearanceDate = function(db, bikeNumber, callback) {
    console.log('aggregateFirstAppearanceDate, bikeNumber:', bikeNumber);
    db.collection(inputCollection).aggregate( 
        [ 
            { $match: { bike_numbers: bikeNumber } }, 
            { $group: { _id: {}, date: { $min: "$date" } } } 
        ]).toArray(function(err, result){
            assert.equal(err, null);
            // console.log('aggregateFirstAppearanceDate, result:', result);
            callback(result[0]);
        });
};

var aggregateLastAppearanceDate = function(db, bikeNumber, callback) {
    console.log('aggregateLastAppearanceDate, bikeNumber:', bikeNumber);
    db.collection(inputCollection).aggregate( 
        [
            { $match: { bike_numbers: bikeNumber } }, 
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
    console.log('insertData, bike: ', data.bikeNumber);

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
    distinctInputBikeNumbers(db, function(allBikeNumbers) {
        createForAllBikes(db, allBikeNumbers, function() {
            db.close();
            console.log('... work done.');
        });
    });
});
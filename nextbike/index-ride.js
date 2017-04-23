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
var inputCollection = 'testcollection'; // 'nextbike'; //
var outputCollection = 'testride'; // 'rides'; //

var distinctBikeNumbers = function(db, callback) {
    db.collection(inputCollection).distinct( "bike_numbers", { "bike": 1 }, function(err, docs) {
        assert.equal(err, null);

        docs.sort(function(a, b) {
            return a-b;
        });

        if ( docs[0] === null ) {
            docs = docs.slice(1, docs.length);
        }

        console.log("distinctBikeNumbers, docs: ", docs);
        callback(docs);
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

var createForAllBikes = function(db, bikeNumbers, callback) {
    var bike = 0,
        length = bikeNumbers.length;

    console.log('createForAllBikes length: ', length);

    syncLoop(length, function(loop){  
        // console.log('createForAllBikes loop.iteration: ', loop.iteration());
        // console.log('createForAllBikes bikeNumber: ', bikeNumbers[loop.iteration()]);
        createHaltData(db, bikeNumbers[loop.iteration()], function(result) {
            loop.next();
        } );
    }, function(){
        callback();
    });
};

var createHaltData = function(db, bikeNumber, callback) {
    if ( bikeNumber === null || bikeNumber === undefined ) {
        console.log('createHaltData ERROR, bikeNumber: ', bikeNumber);
        return;
    }
    console.log('createHaltData, bike: ', bikeNumber);

    var halts = [];
    var halt = null;

    var cursor = db.collection(inputCollection)
        .find( {"bike_numbers": bikeNumber } )
        .sort( {"date": 1} )
        .addCursorFlag('noCursorTimeout', true);
    
    cursor.each(function(err, place) {
       assert.equal(err, null);
       if (place !== null) {

          if (halt === null) {
            halt = newHalt(bikeNumber, place);
          }
          
          if (place.lng === halt.coordinates[0] && place.lat === halt.coordinates[1]) {
            halt.endDate = halt.date;
            halt.count = halt.count + 1;
          }
          else {
            if (halt) {
                halts.push(halt);

                halt = newHalt(bikeNumber, place);
            }
          }

       } else {
            if (halt) {
                halts.push(halt);
            }

            insertData(db, halts, function(result) {
                callback(result);
            });
       }
    });
};

// helper function
// creates new halt object 
var newHalt = function(bikeNumber, place) {
    var halt = {};

    halt.bikeNumber = bikeNumber;
    halt.coordinates =  [place.lng, place.lat];
    halt.startDate = place.date;
    halt.endDate = place.date;
    halt.count = 0;

    if (place.spot) {
        halt.stationId = place.uid;
        halt.stationName = place.name;
    }

    console.log('newHaltData, bikeNumber:', halt.bikeNumber, 'coordinates', halt.coordinates);
    return halt;
};

//helper function
//
var insertData = function(db, data, callback) {
    console.log('insertData, length: ', data.length);

    db.collection(outputCollection).insertMany( data, function(err, result) {
        assert.equal(null, err);
        callback(result);
    });
};



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
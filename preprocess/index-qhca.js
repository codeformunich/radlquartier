/*jshint node:true */
"use strict";

var fs = require('fs');
var program = require('commander');
// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/bikeproject?socketTimeoutMS=90000';
var inputCollection = 'halts';

var input = '';
var output = {
    'coordinates': []
};


// // https://zackehh.com/handling-synchronous-asynchronous-loops-javascriptnode-js/
// function syncLoop(iterations, process, exit){
//     var index = 0,
//         done = false,
//         shouldExit = false;
//     var loop = {
//         next:function(){
//             if(done){
//                 if(shouldExit && exit){
//                     return exit(); // Exit if we're done
//                 }
//             }
//             // If we're not finished
//             if(index < iterations){
//                 index++; // Increment our index
//                 process(loop); // Run our process, pass in the loop
//             // Otherwise we're done
//             } else {
//                 done = true; // Make sure we say we're done
//                 if(exit) exit(); // Call the callback on exit
//             }
//         },
//         iteration:function(){
//             return index - 1; // Return the loop number we're on
//         },
//         break:function(end){
//             done = true; // End the loop
//             shouldExit = end; // Passing end as true means we still call the exit callback
//         }
//     };
//     loop.next();
//     return loop;
// }


MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

    console.log('MongoClient.connect');

    // // create map data for the bike with the bike_number 97252
    // createMapDataSets(db, 97252, function() {
    //     db.close();
    // } );

    // creare map data for all bikes
    createForAllFeatures(db, function(result) {
        db.close();

        // var outputCount = output.districts.length;

        fs.writeFile( 'allCoordinates.geojson',
            JSON.stringify(output.coordinates, null, '\t'),
            function(err) {
                if (err) {
                    console.log('ERROR: MongoClient.connect:', err);
                    return;
                 }
            }
        );

        console.log('MongoClient.connect, wrote files');
        // console.log(JSON.stringify(output, null, '\t'));
    });
});


var createForAllFeatures = function(db, callback) {
    console.log('createForAllFeatures');

    createJson(db, function(result) {
        callback();
    });


    // var length = features.length;

    // // console.log('createForAllFeatures length: ', length);

    // syncLoop(length, function(loop){
    //     // console.log('createForAllBikes loop.iteration: ', loop.iteration());
    //     // console.log('createForAllBikes bikeNumber: ', bikeNumbers[loop.iteration()]);
    //     createJson(db, features[loop.iteration()], function(result) {
    //         loop.next();
    //     } );
    // }, function(){
    //     callback();
    // });
};

var createJson = function(db, callback) {
    console.log('createJson');

    var collection = db.collection(inputCollection);
    collection.aggregate(
        [
            {
                $project: {
                    bikeNumber: "$bikeNumber",
                    coordinates: "$loc.coordinates"
                    // year: { $year: "$startDate"},
                    // month: { $month: "$startDate" },
                    // day: { $dayOfMonth: "$startDate" },
                    // hour: { $hour: "$startDate" },
                    // week: { $isoWeek: "$startDate" },
                    // dayOfWeek: { $isoDayOfWeek: "$startDate" }
                }
            }
            // {
            //     $group: {
            //         _id: { year: "$year", month: "$month"},
            //         count: { $sum: 1 }
            //     }
            // },
            // {
            //     $sort : { "_id.year": 1, "_id.month": 1 }
            // }
        ],
        {
            allowDiskUse: true
        },
        function(err, results) {
            assert.equal(err, null);
            // console.log('createDistrictJson, results: ', results);

            var haltData = {
                "coordinates": []
            };

            var resultcount = results.length;
            for (var i = 0; i < resultcount; i++) {
                haltData.coordinates.push(results[i].coordinates);
            }

            output.coordinates = haltData.coordinates;
            callback();
        }
    );
};

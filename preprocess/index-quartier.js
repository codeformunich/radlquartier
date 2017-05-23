/*jshint node:true */
"use strict";

var program = require('commander');
// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/bikeproject';
var inputCollection = 'halts';

var input = '';
var output = { 
    'districts': []
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


process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var json,
        featuresCount,
        features;

    json = JSON.parse(input);

    features = json.features;
    featuresCount = features.length;
    // console.log('process.stdin.on, featuresCount:', featuresCount);

    MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

        // // create map data for the bike with the bike_number 97252
        // createMapDataSets(db, 97252, function() {
        //     db.close();
        // } );

        // creare map data for all bikes
        createForAllFeatures(db, features, function(result) {
            db.close();
            console.log(JSON.stringify(output, null, '\t'));
        });
    });
});

var createForAllFeatures = function(db, features, callback) {
    var length = features.length;

    // console.log('createForAllFeatures length: ', length);

    syncLoop(length, function(loop){  
        // console.log('createForAllBikes loop.iteration: ', loop.iteration());
        // console.log('createForAllBikes bikeNumber: ', bikeNumbers[loop.iteration()]);
        // createDistrictJson(db, features[loop.iteration()], function(result) {
        //     loop.next();
        // } );
        createMonthJson(db, features[loop.iteration()], function(result) {
            loop.next();
        } );
    }, function(){
        callback();
    });
};


var createDistrictJson = function(db, feature, callback) {
    if ( feature === null || feature === undefined ) {
        console.log('ERROR: createDistrictJson, feature:', feature);
        return;
    }
    // console.log('createDistrictJson, name: ', feature.properties.name);

    var cursor,
        districtData;

    cursor = db.collection(inputCollection).find({
        loc: {
            $geoWithin: {
                $geometry: {
                    type: "MultiPolygon",
                    coordinates: feature.geometry.coordinates
                }
            }
        }
    });
    
    cursor.count(function(err, docs) {
        assert.equal(err, null);
        
        // console.log('createDistrictJson, count: ', docs);

        districtData = {
            "name": feature.properties.name,
            "sum": docs
        };

        output.sum.push(districtData);

        callback();
    });

    

    // cursor.each(function(err, mapdata) {
    //     assert.equal(err, null);
    //     if (mapdata !== null) {
    //         var coordinates = [];
    //         coordinates.push(mapdata.coordinates[0]);
    //         coordinates.push(mapdata.coordinates[1]);
    //         // console.log('createMapDataSets, coordinates: ', coordinates);


    //         lineString.geometry.coordinates.push( coordinates );
            
    //         var point = {
    //                 "type": "Feature",
    //                 "geometry": {
    //                     "type": "Point", 
    //                     "coordinates": coordinates
    //                 },
    //                 "properties": {
    //                     "bike": bike,
    //                     "date": mapdata.date,
    //                     "count": mapdata.count
    //                 }
    //             };

    //         featureCollection.features.push(point);
    //     } else {
    //         //console.log('log else: ', mapData);
            
    //         callback(featureCollection);
    //     }
    // });
};

var createMonthJson = function(db, feature, callback) {
    if ( feature === null || feature === undefined ) {
        console.log('ERROR: createDistrictJson, feature:', feature);
        return;
    }
    // console.log('createDistrictJson, name: ', feature.properties.name);
    
    var collection = db.collection(inputCollection);
    collection.aggregate( 
        [ 
            {
                $match: {
                    loc: {
                        $geoWithin: {
                            $geometry: {
                                type: "MultiPolygon",
                                coordinates: feature.geometry.coordinates
                            }
                        }
                   }
                }
            },
            { 
                $project: {
                    bikeNumber: "$bikeNumber",
                    year: { $year: "$startDate"},
                    month: { $month: "$startDate" },
                    day: { $dayOfMonth: "$startDate" },
                    hour: { $hour: "$startDate" },
                    week: { $isoWeek: "$startDate" },
                    dayOfWeek: { $isoDayOfWeek: "$startDate" }
                } 
            },
            { 
                $group: { 
                    _id: { year: "$year", month: "$month"}, 
                    count: { $sum: 1 }
                } 
            },
            { 
                $sort : { "_id.year": 1, "_id.month": 1 } 
            }      
        ],      
        function(err, results) {
            assert.equal(err, null);
            // console.log('createDistrictJson, results: ', results);

            var districtData = {
                'name': feature.properties.name,
                'totalCount': 0,
                'monthlyAverage': 0,
                'monthlyCounts': []
            };

            var resultcount = results.length;
            for (var i = 0; i < resultcount; i++) {
                var value = {
                    'year': results[i]._id.year,
                    'month': results[i]._id.month,                    
                    'count': results[i].count
                };
                
                districtData.monthlyCounts.push(value);
                districtData.totalCount = districtData.totalCount + value.count;
            }

            districtData.monthlyAverage = districtData.totalCount / districtData.monthlyCounts.length;

            output.districts.push(districtData);
            callback();
        }
    );
};

/*jshint node:true */
"use strict";

var program = require('commander');
// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');
var ss = require('simple-statistics');

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

            var outputCount = output.districts.length;
            // for (var i = 0; i < outputCount; i++) {
                // var fileName = 'cartodb_id_' + output.districts[i].id + '.geo.json';
                var fileName = 'district_halts.json';
                fs.writeFile( fileName,
                    JSON.stringify(output.districts, null, '\t'),
                    function(err) {
                        if (err) {
                            console.log('ERROR: createForAllFeatures:', err);
                            return;
                         }
                });
            // }

            console.log('createForAllFeatures, wrote files');

            // console.log(JSON.stringify(output, null, '\t'));
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
                    dayOfYear: { $dayOfYear: "$startDate" },
                    month: { $month: "$startDate" },
                    dayOfMonth: { $dayOfMonth: "$startDate" },
                    hour: { $hour: "$startDate" },
                    week: { $isoWeek: "$startDate" },
                    dayOfWeek: { $isoDayOfWeek: "$startDate" }
                }
            },
            {
                $group: {
                    _id: {
                        year: "$year",
                        dayOfYear: "$dayOfYear",
                        month: "$month",
                        dayOfMonth: "$dayOfMonth",
                        week: "$week",
                        dayOfWeek: "$dayOfWeek"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort : { "_id.year": 1, "_id.dayOfYear": 1 }
            }
        ],
        function(err, results) {
            assert.equal(err, null);
            // console.log('createDistrictJson, results: ', results);

            var districtData = {
                'name': feature.properties.name,
                'id': feature.properties.cartodb_id,
                'totalCount': 0,
                'meanYears': 0,
                'meanMonth': 0,
                'meanYearMonth': [0,0,0,0,0,0,0,0,0,0,0,0],
                'meanWeeks': 0,
                'meanWeekDays': [0,0,0,0,0,0,0],
                'meanDays': 0,
            };

            var data = {
                'years': [],
                'yearMonth': [[], [], [], [], [], [], [], [], [], [], [], []],
                'month': [],
                'weeks': [],
                'weekDays': [[], [], [], [], [], [], []],
                'days' : [],
            };

            var details = [];

            var yearCount = -1;
            var resultcount = results.length;
            for (var i = 0; i < resultcount; i++) {
                var result = results[i];

                if(result._id.year == 2016 && result._id.month == 6) {
                    continue;
                }

                if (details.length === 0 ||
                    details[yearCount].date.year !== result._id.year) {
                    details.push(newYear(result._id.year,
                        result._id.month,
                        result._id.week,
                        result._id.dayOfYear));

                    yearCount++;
                }

                districtData.totalCount += result.count;

                // details
                details[yearCount].date.lastMonth = result._id.month;
                details[yearCount].date.lastWeek = result._id.week;
                details[yearCount].date.lastDayOfYear = result._id.dayOfYear;

                details[yearCount].totalCount += result.count;
                details[yearCount].month[result._id.month - 1] += result.count;
                details[yearCount].weeks[result._id.week - 1] += result.count;
                details[yearCount].weekDays[result._id.dayOfWeek - 1].push(result.count);
                details[yearCount].days.push(result.count);
            }

            // fill data
            for (var j = 0; j <= yearCount; j++) {
                var year = details[j];
                // console.log('callc means, year:', yearCount, year.date.year);

                data.years.push(year.totalCount);

                for (var m = 0; m < 12; m++) {
                    // console.log('year.date: ', year.date);
                    if(j === 0 && m < year.date.firstMonth - 1) {
                        continue;
                    }

                    if(j === yearCount && m > year.date.lastMonth) {
                        continue;
                    }

                    data.yearMonth[m].push(year.month[m]);
                    data.month.push(year.month[m]);
                }

                for (var w = 0; w < 53; w++) {
                    if(j === 0 && w <= year.date.firstWeek) {
                        continue;
                    }

                    if(j === yearCount && w > year.date.lastWeek) {
                        continue;
                    }

                    data.weeks.push(year.weeks[w]);
                }

                for (var wd = 0; wd < 7; wd++) {
                    data.weekDays[wd] = data.weekDays[wd].concat(year.weekDays[wd]);
                }

                data.days = data.days.concat(year.days);
            }

            // calculate means
            districtData.meanYears = ss.mean(data.years);
            districtData.meanMonth = ss.mean(data.month);

            for (var l = 0; l < 12; l++) {
                if (data.yearMonth[l].length === 0) {
                    districtData.meanYearMonth[l] = 0;
                }
                else if (data.yearMonth[l].length === 1) {
                    districtData.meanYearMonth[l] = data.yearMonth[l][0];
                }
                else {
                    districtData.meanYearMonth[l] = ss.mean(data.yearMonth[l]);
                }
            }

            districtData.meanWeeks = ss.mean(data.weeks);

            for (var k = 0; k < 7; k++) {
                if (data.weekDays[k].length === 0) {
                    districtData.meanWeekDays[k] = 0;
                }
                else if (data.weekDays[k].length === 1) {
                    districtData.meanWeekDays[k] = data.weekDays[k][0];
                }
                else {
                    districtData.meanWeekDays[k] = ss.mean(data.weekDays[k]);
                }
            }

            districtData.meanDays = ss.mean(data.days);

            output.districts.push(districtData);
            callback();
        }
    );
};

var arrayFilterNotZero = function(array) {
    return array.filter( function(value) {
        return value !== 0;
    } );
};

var newYear = function(year, month, week, dayOfYear) {
    var newYear = {
        'date': {
            'year': year,
            'firstMonth': month,
            'firstWeek': week,
            'firstDayOfYear': dayOfYear,
            'lastmonth': month,
            'lastWeek': week,
            'lastDayOfYear': dayOfYear
        },
        'totalCount': 0,

        'meanMonth': 0,
        'meanWeeks': 0,
        'meanWeekDays': [0,0,0,0,0,0,0],
        'meanDays': 0,

        'month': [0,0,0,0,0,0,0,0,0,0,0,0],
        'weeks': [],
        'weekDays': [[], [], [], [], [], [], []],
        'days': []
    };

    for (var i = 0; i < 53; i++) {
        newYear.weeks.push(0);
    }

    return newYear;
};


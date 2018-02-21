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

MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

    console.log('MongoClient.connect');

    // creare map data for all bikes
    createJson(db, function(result) {
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

var createJson = function(db, callback) {
    console.log('createJson');

    var collection = db.collection(inputCollection);
    var cursor = collection.aggregate(
        [
            {
                $project: {
                    // bikeNumber: "$bikeNumber",
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
            cursor: { },
            allowDiskUse: true,
            explain: false
        }, null
    );

    cursor.on("data", function (data) {
       // console.log('createJson, cursor.on("data"):', data);

        output.coordinates.push(data.coordinates);
    });

    cursor.on("end", function (data) {
       console.log('createJson, cursor.on("end"):', data);
       callback();
    });
};

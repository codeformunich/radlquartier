/*jshint node:true */
"use strict";

var program = require('commander');

// load commandline arguments
program.parse(process.argv);
var arg = Number(program.args[0]);
// console.log("lineString called for: ", arg);

// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/infovis';

MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);

    // // create map data for the bike with the bike_number 97252
    // createMapDataSets(db, 97252, function() {
    //     db.close();
    // } );

    // creare map data for all bikes
    createLineString(db, arg, function(result) {
        db.close();
        console.log(JSON.stringify(result, null, '\t'));
    });
});

var createLineString = function(db, bike, callback) {
    if ( bike === null || bike === undefined ) {
        return;
    }
    // console.log('createLineString, bike: ', bike);

    var featureCollection = {
                "type": "FeatureCollection",
                "features": [ ]
            };

    var lineString = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": []
        },
        "properties": {
            "bike": bike
        }
    };

    
    featureCollection.features.push(lineString);

    var cursor = db.collection('mapdatasets').find( {"bike": bike } ).sort( {"date": 1} );
    cursor.each(function(err, mapdata) {
        assert.equal(err, null);
        if (mapdata !== null) {
            var coordinates = [];
            coordinates.push(mapdata.coordinates[0]);
            coordinates.push(mapdata.coordinates[1]);
            // console.log('createMapDataSets, coordinates: ', coordinates);


            lineString.geometry.coordinates.push( coordinates );
            
            var point = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point", 
                        "coordinates": coordinates
                    },
                    "properties": {
                        "bike": bike,
                        "date": mapdata.date,
                        "count": mapdata.count
                    }
                };

            featureCollection.features.push(point);
        } else {
            //console.log('log else: ', mapData);
            
            callback(featureCollection);
        }
    });
};
/*jshint node:true */
"use strict";

var fs = require('fs');
// var program = require('commander');

var callbackCount = 0;
var stationCount = 0;

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var json, 
        stations,  
        index = 0,
        output;

    json = JSON.parse(input);
    // console.log(input);
    // console.log(json);

    stations = json.addedStations;
    stationCount = stations.length;

    output = { 
        "type": "FeatureCollection",
        "features": []
    };

    for (index; index < stationCount; index++) {
        output.features.push(newGeojsonStation(stations[index]));        
    }

    var fileName = 'stations.geojson';
    fs.writeFile( fileName, 
        JSON.stringify(output, null, '\t'), 
        function(err) {
            if (err) { 
                console.log('ERROR: createForAllFeatures:', err); 
            }        
        }
    );

    console.log('wrote file');
});


// helper function
// creates new bike object 
var newGeojsonStation = function(station) {
    
    // {
    //     "type": "RENTAL",
    //     "id": "00e6825bb9f1782eb8b298c79011fde4",
    //     "placeID": "487192",
    //     "latitude": 48.10127258300781,
    //     "longitude": 11.546428680419922,
    //     "name": "Thalkirchen (Tierpark)",
    //     "available": 4,
    //     "provider": "MVG_RAD",
    //     "district": "Thalkirchen-Obersendling-Forstenried-Fürstenried-Solln"
    // }

    var geojson = { 
        "type": "Feature",
        "geometry": {
            "type": "Point", 
            "coordinates": [station.longitude, station.latitude]
        },
        "properties": station
    };

    console.log('newStation, station:', geojson.properties.name);
    return geojson;
};







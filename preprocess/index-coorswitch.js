/*jshint node:true */
"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var json,
        coordinates,
        coordinatesCount,
        lon,
        lat;

    json = JSON.parse(input);
    // console.log(input);
    // console.log(json);

    coordinates = json.features[0].geometry.coordinates;
    
    if( coordinates.constructor === Array ) {
        coordinatesCount = coordinates[0].length;
        // console.log(citys[0].name);
        // console.log(cityCount);

        for (var i = 0; i < coordinatesCount; i++) {
            lat = coordinates[0][i][0];
            lon = coordinates[0][i][1];

            coordinates[0][i][0] = lon;
            coordinates[0][i][1] = lat;
        }    
    }
    else {
        console.log('ERROR: coordinates is nor array');
    }

    json.features[0].geometry.coordinates = coordinates;

    console.log(JSON.stringify(json, null, '\t'));
});
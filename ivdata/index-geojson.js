/*jshint node:true */
"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    // console.log('call process.stdin.on');
    
    var json,
        placeCount,
        geojson;

    json = JSON.parse(input);
    // console.log(json);

    placeCount = json.length;
    // console.log(placeCount);

    geojson = {
        "type": "FeatureCollection",
        "features": []
    };

    for (var i = 0; i < placeCount; i++) {
        var place = json[i];

        geojson.features[geojson.features.length] = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [ Number(place.lng), Number(place.lat) ]
            },
            "properties": place
        };

        // console.log(json[i]);
    }

    console.log(JSON.stringify(geojson, null, '\t'));
});

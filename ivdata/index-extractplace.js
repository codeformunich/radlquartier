/*jshint node:true */
"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';
process.stdin.on('data', function (chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
    var citys,
        cityCount,
        json,
        places;

    json = JSON.parse(input);
    // console.log(json.markers.country.city.length);

    citys = json.markers.country.city;
    cityCount = citys.length;
    // console.log(citys[0].name);
    // console.log(cityCount);

    for (var i = 0; i < cityCount; i++) {
        if (citys[i].name === 'München') {
            // console.log(json.markers.country.city[i]);
            places = citys[i].place;
        }
    }

    console.log(JSON.stringify(places, null, '\t'));
});
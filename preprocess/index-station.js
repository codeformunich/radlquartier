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
        place;

    json = JSON.parse(input);
    // console.log(json);

    placeCount = json.length;
    // console.log(placeCount);

    for (var i = 0; i < placeCount; i++) {
        if(!json[i].date) {
            json[i].date = date;
            // console.log(json[i]);
        }
    }

    console.log(JSON.stringify(json, null, '\t'));
});

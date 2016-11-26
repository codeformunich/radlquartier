/*jshint node:true */
"use strict";

var program = require('commander');
var moment = require('moment');

program.parse(process.argv);

var arg = program.args[0].split('.')[0];

var date = moment(arg, 'YYYY-MM-DDT hh/mm/ss');
// console.log(program.args[0]);
// console.log(date);

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

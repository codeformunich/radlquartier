/*jshint node:true */
"use strict";

var program = require('commander');
var moment = require('moment');

program.parse(process.argv);

var arg = program.args[0].split('.')[0];

var date = arg.replace('/', ':');
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
        if (json[i].spot) {
            json[i].uid = Number(json[i].uid);
            json[i].lat = Number(json[i].lat);
            json[i].lng = Number(json[i].lng);
            json[i].spot = Number(json[i].spot);
            json[i].number = Number(json[i].number);
            json[i].bike_racks = Number(json[i].bike_racks);
            json[i].free_racks = Number(json[i].free_racks);

            if (json[i].bike_numbers) {
                var bikeNumbers = json[i].bike_numbers.split(',');
                // console.log(bikeNumbers);
                // console.log(bikeNumbers.length);
                
                json[i].bike_numbers = [];
                for (var j = 0; j < bikeNumbers.length; j++) {
                     // console.log(bikeNumbers[j]);
                    json[i].bike_numbers[j] = Number(bikeNumbers[j]);
                }
            }
        }
        else {
            json[i].uid = Number(json[i].uid);
            json[i].lat = Number(json[i].lat);
            json[i].lng = Number(json[i].lng);
            json[i].bikes = Number(json[i].bikes);
            json[i].bike = Number(json[i].bike);
            json[i].bike_numbers = Number(json[i].bike_numbers);
        }

        if(!json[i].date) {
            json[i].date = { "$date": date };
            // console.log(json[i]);
        }
    }

    console.log(JSON.stringify(json, null, '\t'));
});

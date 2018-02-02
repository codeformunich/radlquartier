/*jshint node:true */
'use strict';

const fs = require('fs');
const uuidv4 = require('uuid/v4');

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateHalts.json';

let haltData = null;
let oldTempData = null;
let newTemopData = [];
let input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
    input = input + chunk;
});

process.stdin.on('end', function () {
    let index = 0;

    const json = JSON.parse(input);
    // console.log(input);
    // console.log(json);

    const bikes = json.addedBikes;
    const bikesCount = bikes.length;

    const outputPathTemp = outputFolder + '/' + tempFileName;
    const outputPathData = outputFolder + '/' + dataFileName;

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    oldTempData = loadExitingJsonFile(outputPathTemp);

    if (fs.existsSync(outputPathData)) {
        try {
            haltData = JSON.parse(fs.readFileSync(outputPathData));
        } catch (error) {
            console.log('process.stdin.on, error', error);
            throw error;
        }
    } else {
        console.log('No ' + outputPathData + ' file creating new one.');
        haltData = [];
    }

    for (index; index < bikesCount; index++) {
        generateHalt(bikes[index]);
    }

    try {
        fs.writeFileSync(outputPathData, JSON.stringify(haltData, null, '\t'));
    } catch (error) {
        console.log('process.stdin.on, error', error);
        throw error;
    }

    try {
        fs.writeFileSync(outputPathTemp, JSON.stringify(newTemopData, null, '\t'));
    } catch (error) {
        console.log('process.stdin.on, error', error);
        throw error;
    }

    console.log('Done');
});

const loadExitingJsonFile = function (filePath) {
    if (!fs.existsSync(filePath)) {
        console.log('No ' + filePath + ' file creating new one.');
        return [];
    }

    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        console.log('process.stdin.on, error', error);
        throw error;
    }
};

const generateHalt = function (bike) {
    // console.log('generateHalt, bike.bikeNumber:', bike.bikeNumber);

    const lastHalt = findLastHalt(bike);
    // console.log('generateHalt, lastHalt:', lastHalt);

    if (lastHalt === null || lastHalt === undefined) {
        insertHalt(bike);
    } else {
        // console.log( 'generateHalt, bike:', bike);
        // console.log( 'generateHalt, lastHalt:', lastHalt);

        // console.log( 'generateHalt:', lastHalt.loc.coordinates[0], bike.longitude, 
        //     lastHalt.loc.coordinates[1], bike.latitude);
        if (lastHalt.loc.coordinates[0] === bike.longitude && lastHalt.loc.coordinates[1] === bike.latitude) {
            // console.log( 'generateHalt, bike:', bike);
            updateHalt(bike, lastHalt);
        } else {
            // console.log( 'generateHalt, bike:', bike);
            insertHalt(bike);
        }
    }
};

var findLastHalt = function (bike) {
    // console.log('findLastHalt, newBike.bikeNumber:', bike.bikeNumber);
    if (oldTempData === null || oldTempData === undefined) {
        console.log('findLastHalt, oldTempData: null or undefined');
        return null;
    }

    return oldTempData.find(function (temp) {
        // if (temp.bikeNumber === bike.bikeNumber){
        //     console.log( 'findLastHalt found bikeNumber:', bike.bikeNumber);
        // }
        return temp.bikeNumber === bike.bikeNumber;
    });
};

var insertHalt = function (bike) {
    var halt = newHalt(bike);
    if (halt === null) {
        console.log('ERROR insertHalt, halt: ', halt);
        return;
    }

    haltData.push(halt);
    newTemopData.push(halt);

    // console.log('insertHalt, bikeNumber:', halt.bikeNumber, 'id:', halt.id);
};

var updateHalt = function (bike, lastHalt) {

    const index = haltData.findIndex(function (halt) {
        return halt.id === lastHalt.id;
    });

    const date = new Date(bike.updated);

    haltData[index].dates.push(date);
    haltData[index].endDate = date;
    haltData[index].count = haltData[index].count + 1;

    newTemopData.push(haltData[index]);

    // console.log('updateHalt, bikeNumber:', haltData[index].bikeNumber, 'id:', haltData[index].id);
};

// helper function
// creates new halt object 
var newHalt = function (bike) {
    if (bike === null || bike === undefined) {
        console.log('ERROR: newHalt, bike:', bike);
        return null;
    }

    var halt = {};
    var date = new Date(bike.updated);

    halt.id = uuidv4();
    halt.bikeNumber = bike.bikeNumber;
    halt.loc = {
        type: 'Point',
        coordinates: [bike.longitude, bike.latitude]
    };
    halt.startDate = date;
    halt.endDate = date;

    halt.count = 1;
    halt.dates = [date];

    if (bike.currentStationID) {
        halt.stationId = bike.currentStationID;

        // TODO standardize
        //halt.stationId = place.uid;
        //halt.stationName = place.name;
    }

    // console.log('newHalt, bikeNumber:', halt.bikeNumber, halt.id);
    return halt;
};
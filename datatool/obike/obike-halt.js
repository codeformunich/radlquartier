/**
 * halt
 *
 */
'use strict';

const helper = require('./../share/helper');

const program = require('commander');
const path = require('path');
const uuidv4 = require('uuid/v4');

const outputFolder = 'output';
const tempFileName = 'obikeTemp.json';
const dataFileName = 'obikeHalts.json';

let haltData = null;
let tempData = null;

program.parse(process.argv);
const args = program.args;

const main = function() {
  const inputFolder = args[0];
  if (
    inputFolder === null ||
    inputFolder === undefined ||
    inputFolder.length === 0
  ) {
    console.log('ERROR: main, inputFolder:', inputFolder);
    return;
  }

  const outputPathTemp = path.join(outputFolder, tempFileName);
  const outputPathData = path.join(outputFolder, dataFileName);

  tempData = helper.loadJsonFile(outputPathTemp);
  if (tempData == null) {
    console.log('INFO: main, create new tempData object');
    tempData = {};
  }
  haltData = helper.loadJsonFile(outputPathData);
  if (haltData == null) {
    console.log('INFO: main, create new haltData array');
    haltData = [];
  }

  const filenames = helper.readDirectory(inputFolder);
  // possible file names are:
  // - muc-2017-09-07T12:40:22+0200.json
  // - muc-2017-09-07T23:55:19+0200-11.37267149695314-48.16890050781732.json
  // - muc-2017-09-07T12_40_22+0100.json
  const regex = /muc-(.+?\+\d+)/
  
  filenames.forEach(function(filename) {
    if (path.extname(filename) !== '.json') {
      return;
    }

    console.log('INFO: main, filename:', filename);

    const filePath = path.join(inputFolder, filename);
    const date = regex.exec(filePath)[1].replace(/_/g, ':');
    const json = helper.loadJsonFile(filePath);

    var bikes = json.data.list;
    for (var index = 0; index < bikes.length; index++) {
      // "convert" data from obike to target
      bikes[index].updated = date;
      bikes[index].bikeNumber = bikes[index].id;
    }
    generateHalts(bikes);
  });

  if (haltData.length === 0) {
    console.log('ERROR main, haltData: empty');
    return;
  }

  helper.createDirectory(outputFolder);
  helper.writeJsonFile(outputPathData, haltData);
  helper.writeJsonFile(outputPathTemp, tempData);

  console.log('INFO: main: Done!');
};

const generateHalts = function(rawBikes) {
  rawBikes.forEach(function(rawBike) {
    const lastExistingHalt = findLastExistingHalt(rawBike.bikeNumber);

    if (
      lastExistingHalt &&
      lastExistingHalt.loc.coordinates[0] === rawBike.longitude &&
      lastExistingHalt.loc.coordinates[1] === rawBike.latitude
    ) {
      updateHalt(rawBike, lastExistingHalt);
    } else {
      createHalt(rawBike);
    }
  });
};

const findLastExistingHalt = function(bikeNumber) {
  if (tempData === null || tempData === undefined) {
    console.log('ERROR: findLastHalt, tempData:', tempData);
    return null;
  }

  if (tempData.hasOwnProperty(bikeNumber)) {
    return tempData[bikeNumber];
  }

  return null;
};

const createHalt = function(bike) {
  const halt = newHalt(bike);
  if (halt === null) {
    console.log('ERROR: createHalt, halt: ', halt);
    return;
  }

  haltData.push(halt);
  tempData[halt.bikeNumber] = halt;
};

const updateHalt = function(bike, lastHalt) {
  const index = haltData.findIndex(function(halt) {
    return halt.id === lastHalt.id;
  });

  const date = new Date(bike.updated);

  haltData[index].endDate = date;
  haltData[index].additionalData.count =
    haltData[index].additionalData.count + 1;

  tempData[haltData[index].bikeNumber] = haltData[index];
};

// helper function
// creates new halt object
const newHalt = function(rawBike) {
  if (rawBike === null || rawBike === undefined) {
    console.log('ERROR: newHalt, bike:', rawBike);
    return null;
  }

  const date = new Date(rawBike.updated);
  let halt = {
    id: uuidv4(),
    bikeNumber: rawBike.bikeNumber,
    loc: {
      type: 'Point',
      coordinates: [rawBike.longitude, rawBike.latitude]
    },
    startDate: date,
    endDate: date,
    additionalData: {
      provider: 'OBIKE',
      count: 1,
      // additionalData.dates = [date]; // Too much data
      // TODO? additional obike 2017 data we currenlty ignore
      //   imei:6C697A6174346F6E
      //   iconUrl:null
      //   promotionActivityType:null
      //   rideMinutes:null
      //   countryId:60
      //   helmet:0
    }
  };

  return halt;
};

main();

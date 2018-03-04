/**
 * halt
 *
 */
'use strict';

const helper = require('./../share/helper');

const program = require('commander');
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateHalts.json';

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

/*  const filenames = helper.readDirectory(inputFolder);
  filenames.forEach(function(filename) {
    if (path.extname(filename) !== '.json') {
      return;
    }

    console.log('INFO: main, filename:', filename);

    const filePath = path.join(inputFolder, filename);
    const json = helper.loadJsonFile(filePath);

    if (json == null) {
      console.log('ERROR main, json:', json);
      return;
    }

    const bikes = json.addedBikes;
    generateHalts(bikes);
  });*/
  processDirectory(inputFolder);

  if (haltData.length === 0) {
    console.log('ERROR main, haltData: empty');
    return;
  }

  helper.createDirectory(outputFolder);
  helper.writeJsonFile(outputPathData, haltData);
  helper.writeJsonFile(outputPathTemp, tempData);

  console.log('INFO: main: Done!');
};

const processDirectory = function(inputFolder) {
  const filenames = helper.readDirectory(inputFolder);
  filenames.forEach(function(filename) {
    if (path.basename(filename) != '.' && path.basename(filename) != '..' && fs.lstatSync(path.resolve(inputFolder + '/' + filename)).isDirectory()) {
      processDirectory(inputFolder + '/' + filename);
    }

    if (path.extname(filename) !== '.json') {
      return;
    }

    console.log('INFO: main, filename:', filename);

    const filePath = path.join(inputFolder, filename);
    const json = helper.loadJsonFile(filePath);

    if (json == null) {
      console.log('ERROR main, json:', json);
      return;
    }

    const bikes = json.addedBikes;
    if(bikes) {
      generateHalts(bikes);
    }
  });
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
      provider: 'MVG_RAD',
      count: 1,
      // additionalData.dates = [date]; // Too much data
      stationId: rawBike.currentStationID,
      // TODO standardize between mvg-networkstate
      //   addedBike.currentStationID
      //   addedStation.id
      //   addedStation.placeID
      //   addedStation.name
      // and nextbike-mvgrad
      //   place.uid
      //   place.name
      district: rawBike.district
    }
  };

  return halt;
};

main();

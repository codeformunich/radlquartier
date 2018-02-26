/**
 * halt
 *
 */
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateHalts.json';

let haltData = null;
let tempData = null;
// let input = '';

program.parse(process.argv);

const args = program.args;
// console.log('mvgstate-halt, args:', args);
const inputFolder = args[0];
console.log('mvgstate-halt, inputFolder:', inputFolder);
if (inputFolder === null || inputFolder === undefined || inputFolder.length === 0) {
  console.log('ERROR mvgstate-halt.process.stdin.on, inputFolder:', inputFolder);
  return;  
}

// process.stdin.resume();
// process.stdin.setEncoding('utf8');

// process.stdin.on('data', function(chunk) {
//   input = input + chunk;
// });

// process.stdin.on('end', function() {
const main = function(){
  const outputPathTemp = outputFolder + '/' + tempFileName;
  const outputPathData = outputFolder + '/' + dataFileName;

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  tempData = loadJsonFile(outputPathTemp);
  if (tempData == null) {
    console.log('INFO mvgstate-halt.process.stdin.on, create new tempData object');
    tempData = {};
  }
  haltData = loadJsonFile(outputPathData);
  if (haltData == null) {
    console.log('INFO mvgstate-halt.process.stdin.on, create new haltData array');
    haltData = [];
  }

  const filenames = readFiles(inputFolder);
  const filenamesCount = filenames.length;
  for (let index = 0; index < filenamesCount; index++) {
    const filename = filenames[index];
    if (path.extname(filename) === '.json') {
      const filePath = path.join(inputFolder, filename) ;
      console.log('INFO mvgstate-halt.process.stdin.on, filePath:', filePath);

      const json = loadJsonFile(filePath);
      if (json == null) {
        console.log('ERROR mvgstate-halt.process.stdin.on, json:', json);
        continue;
      }

      const bikes = json.addedBikes;
      generateHalts(bikes);
    }
  }
  
  // filenames.forEach(function(filename) {
  //   if (path.extname(filename) === '.json') {
  //     const filePath = path.join(inputFolder, filename) ;
  //     console.log('mvgstate-halt.process.stdin.on, filePath:', filePath);

  //     const json = loadJsonFile(filePath);
  //     if (json == null) {
  //       console.log('ERROR mvgstate-halt.process.stdin.on, json:', json);
  //     }

  //     const bikes = json.addedBikes;
  //     generateHalts(bikes);
  //   }
  // });

  // console.log('mvgstate-halt.process.stdin.on, input:', input);

  // const json = JSON.parse(input);
  // console.log('mvgstate-halt.process.stdin.on, json:', json);

  // const bikes = json.addedBikes;
  // const bikesCount = bikes.length;

  // for (let index = 0; index < bikesCount; index++) {
  // generateHalt(bikes[index]);
  // }

  writeJsonFile(outputPathData, haltData);
  writeJsonFile(outputPathTemp, tempData);

  console.log('Done!');
};
  // });

const readFiles = function(dirname) {
  try {
    return fs.readdirSync(dirname);
  } catch (error) {
    console.log('mvgstate-halt.readFiles, error', error);
    throw error;
  }
};

const loadJsonFile = function(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.log('process.stdin.on, error', error);
    return null;
    // throw error;
  }
};

const writeJsonFile = function(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
  } catch (error) {
    console.log('mvgstate-halt.writeJsonFile, error', error);
    throw error;
  }
};

const generateHalts = function(bikes) {
  const bikesCount = bikes.length;

  for (let index = 0; index < bikesCount; index++) {
    generateHalt(bikes[index]);
  }
};

const generateHalt = function(bike) {
  // console.log('generateHalt, bike.bikeNumber:', bike.bikeNumber);

  const lastHalt = findLastHalt(bike.bikeNumber);
  // console.log('generateHalt, lastHalt:', lastHalt);

  if (lastHalt === null || lastHalt === undefined) {
    insertHalt(bike);
  } else {
    // console.log( 'generateHalt, bike:', bike);
    // console.log( 'generateHalt, lastHalt:', lastHalt);
    // console.log( 'generateHalt, lastHalt.loc', lastHalt.loc.coordinates[0], bike.longitude,
    //     lastHalt.loc.coordinates[1], bike.latitude);
    if (
      lastHalt.loc.coordinates[0] === bike.longitude &&
      lastHalt.loc.coordinates[1] === bike.latitude
    ) {
      // console.log( 'generateHalt, bike:', bike);
      updateHalt(bike, lastHalt);
    } else {
      // console.log( 'generateHalt, bike:', bike);
      insertHalt(bike);
    }
  }
};

const findLastHalt = function(bikeNumber) {
  // console.log('findLastHalt, newBike.bikeNumber:', bike.bikeNumber);
  if (tempData === null || tempData === undefined) {
    console.log('findLastHalt, tempData:', tempData);
    return null;
  }

  // console.log('findLastHalt, tempData[bikeNumber]:', tempData[bikeNumber]);
  if (tempData.hasOwnProperty(bikeNumber)) {
    // console.log('findLastHalt, bikeNumber:', bikeNumber);
    return tempData[bikeNumber];
  }

  return null;

  // for (const key in tempData) {
  //   if (tempData.hasOwnProperty(key)) {
  //     const bike = tempData[key];
      
  //     if (bike.bikeNumber === bikeNumber) {
  //       return bike;
  //     }
  //   }
  // }

  // return null;
};

const insertHalt = function(bike) {
  const halt = newHalt(bike);
  if (halt === null) {
    console.log('ERROR insertHalt, halt: ', halt);
    return;
  }

  haltData.push(halt);
  tempData[halt.bikeNumber] = halt;

  // console.log('insertHalt, bikeNumber:', halt.bikeNumber, 'id:', halt.id);
};

const updateHalt = function(bike, lastHalt) {
  const index = haltData.findIndex(function(halt) {
    return halt.id === lastHalt.id;
  });

  const date = new Date(bike.updated);

  haltData[index].endDate = date;

  haltData[index].additionalData.dates.push(date);
  haltData[index].additionalData.count =
    haltData[index].additionalData.count + 1;

  tempData[haltData[index].bikeNumber] = haltData[index];

  // console.log('updateHalt, bikeNumber:', haltData[index].bikeNumber, 'id:', haltData[index].id);
};

// helper function
// creates new halt object
const newHalt = function(bike) {
  if (bike === null || bike === undefined) {
    console.log('ERROR: newHalt, bike:', bike);
    return null;
  }

  let halt = {};
  const date = new Date(bike.updated);

  halt.id = uuidv4();
  halt.bikeNumber = bike.bikeNumber;
  halt.loc = {
    type: 'Point',
    coordinates: [bike.longitude, bike.latitude]
  };
  halt.startDate = date;
  halt.endDate = date;

  let additionalData = {};
  additionalData.provider = 'MVG_RAD';
  additionalData.count = 1;
  additionalData.dates = [date];

  // TODO standardize
  //halt.stationId = place.uid;
  //halt.stationName = place.name;
  if (bike.currentStationID) {
    additionalData.stationId = bike.currentStationID;
  }

  halt.additionalData = additionalData;

  // console.log('newHalt, bikeNumber:', halt.bikeNumber, halt.id);
  return halt;
};

main();

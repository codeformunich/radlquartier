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
const cliProgress = require('cli-progress');

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateHalts.json';

let haltData = null;
let tempData = null;

const bar2 = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
let bar2Index = 0;

program.parse(process.argv);
const args = program.args;

const main = function() {
  const inputFolder = args[0];
  if (
    inputFolder === null ||
    inputFolder === undefined ||
    inputFolder.length === 0
  ) {
    console.error('main, inputFolder:', inputFolder);
    return;
  }

  const outputPathTemp = path.join(outputFolder, tempFileName);
  const outputPathData = path.join(outputFolder, dataFileName);

  tempData = helper.loadJsonFileSync(outputPathTemp);
  if (tempData == null) {
    console.log('main, create new tempData object');
    tempData = {};
  }
  haltData = helper.loadJsonFileSync(outputPathData);
  if (haltData == null) {
    console.log('main, create new haltData array');
    haltData = [];
  }

  // const filenames = helper.readDirectory(inputFolder);
  // filenames.forEach(function(filename) {
  //   if (path.extname(filename) !== '.json') {
  //     return;
  //   }

  //   console.log('INFO: main, filename:', filename);

  //   const filePath = path.join(inputFolder, filename);
  //   const json = helper.loadJsonFile(filePath);

  //   if (json == null) {
  //     console.log('ERROR main, json:', json);
  //     return;
  //   }

  //   const bikes = json.addedBikes;
  //   generateHalts(bikes);
  // });

  processDirectory(inputFolder)
    .then(() => {
      // stop the progress bar
      bar2.stop();

      if (haltData.length === 0) {
        console.error('main, haltData: empty');
        return;
      }

      helper.createDirectorySync(outputFolder);
      helper.writeJsonFileSync(outputPathData, haltData);
      helper.writeJsonFileSync(outputPathTemp, tempData);

      console.log('main, Done!');
    })
    .catch(error => {
      console.error('main, error:', error.message);
    });
};

const processDirectory = function(inputFolder) {
  // create a new progress bar instance and use shades_classic theme
  const bar1 = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

  let promises = [];

  const filenames = helper.readDirectorySync(inputFolder);

  console.log('process directory');
  // start the progress bar with a total value of 200 and start value of 0
  bar1.start(filenames.length, 0);


  filenames.forEach(function(filename, index) {
    // update the current value in your application..
    bar1.update(index + 1);
    // console.log('processDirectory, filename:', filename);
    
    if (
      path.basename(filename) != '.' &&
      path.basename(filename) != '..' &&
      fs.lstatSync(path.resolve(inputFolder + '/' + filename)).isDirectory()
    ) {
      processDirectory(inputFolder + '/' + filename);
    }

    if (path.extname(filename) !== '.json') {
      return;
    }

    const filePath = path.join(inputFolder, filename);
    promises.push(
      helper.readFile(filePath).then(
        content => {
          // update the current value in your application..
          bar2Index += 1;
          bar2.update(bar2Index);
          // console.log('processDirectory, bar1:', bar1);
          // console.log('processDirectory, barIndex:', barIndex);

          let json = null;
          try {
            json = JSON.parse(content);
          } catch (error) {
            console.error(
              `processDirectory, filePath: ${filePath} error:, ${error}, filePath`
            );
            return;
          }

          if (json == null) {
            console.error('processDirectory, json:', json);
            return;
          }

          const bikes = json.addedBikes;
          if (bikes) {
            generateHalts(bikes);
          }
        },
        error => {
          console.error('processDirectory, error:', error.message);
          return;
        }
      )
    );

    // const json = helper.loadJsonFile(filePath);

    // if (json == null) {
    //   console.log('ERROR main, json:', json);
    //   return;
    // }

    // const bikes = json.addedBikes;
    // if (bikes) {
    //   generateHalts(bikes);
    // }

    
    
  });

  // stop the progress bar
  bar1.stop();

  console.log('process bike data');
  // start the progress bar with a total value of 200 and start value of 0
  bar2.start(filenames.length, 0);
  

  return Promise.all(promises);
};

const generateHalts = function(rawBikes) {
  // console.log('generateHalts, filename', filename);

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

const createHalt = function(bike) {
  const halt = newHalt(bike);
  if (!halt) {
    console.error('createHalt, halt: ', halt);
    return;
  }

  haltData.push(halt);
  tempData[halt.bikeNumber] = halt;
};

const updateHalt = function(bike, lastHalt) {
  // const index = haltData.findIndex(function(halt) {
  //   return halt.id === lastHalt.id;
  // });
  const index = findLastIndexForId(haltData, lastHalt);

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
    console.error('newHalt, bike:', rawBike);
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

const findLastExistingHalt = function(bikeNumber) {
  if (!tempData) {
    console.error('findLastExistingHalt, tempData:', tempData);
    return null;
  }

  if (tempData.hasOwnProperty(bikeNumber)) {
    return tempData[bikeNumber];
  }

  return null;
};

const findLastIndexForId = function(data, lastHalt) {
  // console.info('findLastIndexForId, data:', data);
  // console.info('findLastIndexForId, lastHalt:', lastHalt);
  // console.info('findLastIndexForId, data.length:', data.length);

  for (let index = data.length - 1; index >= 0; index--) {
    // console.info('findLastIndexForId, index:', index);

    if (data[index].id == lastHalt.id) {
      // console.info('findLastIndexForId, return:', index);
      return index;
    }
  }

  console.info('findLastIndexForId, return:', -1);
  return -1;
};

main();

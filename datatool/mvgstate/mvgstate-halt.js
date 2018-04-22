/**
 * halt
 *
 */
'use strict';

const helper = require('./../share/helper');

const program = require('commander');
const path = require('path');
const uuidv4 = require('uuid/v4');
const cliProgress = require('cli-progress');

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateHalts.json';

// create a new progress bar instances
const processDirectoryBar = new cliProgress.Bar(
  {},
  cliProgress.Presets.shades_classic
);
const processDataBar = new cliProgress.Bar(
  {},
  cliProgress.Presets.shades_classic
);
let processDataIndex = 0;

let haltData = null;
let tempData = null;

program.parse(process.argv);
const args = program.args;

/**
 * 
 */
const main = function() {
  const inputFolder = args[0];
  if (!inputFolder || inputFolder.length === 0) {
    console.error('main, inputFolder:', inputFolder);
    return;
  }

  const outputPathTemp = path.join(outputFolder, tempFileName);
  const outputPathData = path.join(outputFolder, dataFileName);

  helper
    .readJsonFile(outputPathTemp)
    .then(json => {
      tempData = helper.PairsToMap(json);

      return helper.readJsonFile(outputPathData);
    })
    .then(json => {
      haltData = helper.PairsToMap(json);

      return processDirectory(inputFolder);
    })
    .then(() => {
      // stop the progress bar
      processDataBar.stop();

      return helper.createDirectory(outputFolder);
    })
    .then(() => {
      if (haltData.size === 0) {
        console.error('main, haltData: empty');
        return;
      }

      return Promise.all([
        helper.writeJsonFile(outputPathData, helper.MapToPairs(haltData)),
        helper.writeJsonFile(outputPathTemp, helper.MapToPairs(tempData))
      ]);
    })
    .then(() => {
      console.log('Done!');
    })
    .catch(error => {
      console.error('main, error:', error.message);
    });
};

/**
 * 
 * @param {*} inputFolder 
 */
const processDirectory = function(inputFolder) {
  return helper.readdir(inputFolder).then(files => {
    let promises = [];

    console.log('process directory');
    // start the progress bar with a total value of 200 and start value of 0
    processDirectoryBar.start(files.length, 0);

    files.forEach(function(filename, index) {
      if (path.extname(filename) !== '.json') {
        return;
      }

      // update the current value in your application..
      processDirectoryBar.update(index + 1);
      // console.log('processDirectory, filename:', filename);

      const filePath = path.join(inputFolder, filename);
      promises.push(
        helper.readJsonFile(filePath).then(
          json => {
            // update the current value in your application..
            processDataIndex += 1;
            processDataBar.update(processDataIndex);

            try {
              processData(json);
            } catch (error) {
              console.error(
                `processDirectory, filePath: ${filePath} error:, ${
                  error.message
                }`
              );
              return;
            }
          },
          error => {
            console.error('processDirectory, error:', error.message);
            return;
          }
        )
      );
    });

    // stop the progress bar
    processDirectoryBar.stop();

    console.log('process files');
    // start the progress bar with a total value of 200 and start value of 0
    processDataBar.start(files.length, 0);

    return Promise.all(promises);
  });
};

/**
 * 
 * @param {*} json 
 */
const processData = function(json) {
  if (!json) {
    throw new Error('processData, json:', json);
  }

  const bikes = json.addedBikes;
  if (!bikes) {
    throw new Error('processData, bikes:', bikes);
  }

  generateHalts(bikes);
};

/**
 * 
 * @param {*} rawBikes 
 */
const generateHalts = function(rawBikes) {
  // console.log('generateHalts, filename', filename);

  rawBikes.forEach(function(rawBike) {
    const lastExistingHalt = tempData.get(rawBike.bikeNumber);

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

/**
 * 
 * @param {*} bike 
 */
const createHalt = function(bike) {
  const halt = newHalt(bike);
  if (!halt) {
    console.error('createHalt, halt: ', halt);
    return;
  }

  haltData.set(halt.id, halt);
  tempData.set(halt.bikeNumber, halt);
};

/**
 * 
 * @param {*} bike 
 * @param {*} lastHalt 
 */
const updateHalt = function(bike, lastHalt) {
  let halt = haltData.get(lastHalt.id);
  if (!halt) {
    console.error('updateHalt, halt: ', halt);
    return;
  }

  halt.endDate = new Date(bike.updated);
  halt.additionalData.count = halt.additionalData.count + 1;

  haltData.set(halt.id, halt); // necessaire?
  tempData.set(halt.bikeNumber, halt);
};

// helper function

/**
 * Creates new halt object
 * @param {*} rawBike 
 */
const newHalt = function(rawBike) {
  if (!rawBike) {
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

main();

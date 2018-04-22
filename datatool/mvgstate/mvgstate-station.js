/**
 * station
 *
 */
'use strict';

const helper = require('./../share/helper');

const program = require('commander');
const path = require('path');
const uuidv4 = require('uuid/v4');
const cliProgress = require('cli-progress');

const outputFolder = 'output';
const dataFileName = 'mvgStation.json';

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

let stationData = null;
let currentDate = null;

program.parse(process.argv);
const args = program.args;

const main = function() {
  const inputFolder = args[0];
  if (!inputFolder || inputFolder.length === 0) {
    console.error('main, inputFolder:', inputFolder);
    return;
  }

  const outputPathData = path.join(outputFolder, dataFileName);

  helper.readJsonFile(outputPathData).then(json => {
    stationData = helper.PairsToMap(json);

    return processDirectory(inputFolder);
  }).then(() => {
    // stop the progress bar
    processDataBar.stop();

    return helper.createDirectory(outputFolder);
  }).then(() => {
    if (stationData.size === 0) {
      console.error('main, stationData: empty');
      return;
    }

    return Promise.all([
      helper.writeJsonFile(outputPathData, [...stationData])
    ]);
  }).then(() => {
    console.log('Done!');
  }).catch(error => {
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

const processData = function(json) {
  if (!json || !json.addedBikes || json.addedBikes.length === 0) {
    throw new Error('processData, json:', json);
  }

  const rawStations = json.addedStations;
  if (!rawStations) {
    throw new Error('processData, rawStations:', rawStations);
  }

  currentDate = new Date(json.addedBikes[0].updated);

  generateStations(rawStations);
};

const generateStations = function(rawStations) {
  rawStations.forEach(function(rawStation) {
    // const existingStation = findStation(rawStation.id, stationData);

    if (stationData.has(rawStation.id)) {
      updateStation(rawStation);
    } else {
      createStation(rawStation);
    }
  });
};

const createStation = function(rawData) {
  const station = newStation(rawData);
  if (!station) {
    console.error('createStation, station:', station);
    return;
  }

  stationData.set(station.stationId, station);
};

const updateStation = function(rawStation) {
  let station = stationData.get(rawStation.id);
  if (!station) {
    console.error('updateStation, station: ', station);
    return;
  }

  station.lastAppearanceDate = currentDate;

  stationData.set(station.stationId, station); // necessaire?
};

// helper function
// creates new station object
const newStation = function(rawStation) {
  if (rawStation === null || rawStation === undefined) {
    console.log('ERROR: newStation, rawStation:', rawStation);
    return null;
  }

  let station = {
    id: uuidv4(),
    stationId: rawStation.id,
    loc: {
      type: 'Point',
      coordinates: [rawStation.longitude, rawStation.latitude]
    },
    firstAppearanceDate: currentDate,
    lastAppearanceDate: currentDate,
    additionalData: {
      provider: rawStation.provider,
      stationName: rawStation.name,
      // bikeRacks: rawStation.?, // TODO where to get?
      district: rawStation.district // TODO do we want it?
    }
  };

  return station;
};

main();

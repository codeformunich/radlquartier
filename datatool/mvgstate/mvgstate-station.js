/**
 * station
 *
 */
'use strict';

const helper = require('./helper');

const program = require('commander');
const path = require('path');
const uuidv4 = require('uuid/v4');

const outputFolder = 'output';
const dataFileName = 'mvgStation.json';

let data = null;
let date = null;

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

  const outputPathData = path.join(outputFolder, dataFileName);

  data = helper.loadJsonFile(outputPathData);
  if (data == null) {
    console.log('INFO: main, create new data array');
    data = [];
  }

  const filenames = helper.readDirectory(inputFolder);
  filenames.forEach(function(filename) {
    if (path.extname(filename) !== '.json') {
      return;
    }

    console.log('INFO: main, filename:', filename);

    const filePath = path.join(inputFolder, filename);
    const json = helper.loadJsonFile(filePath);

    if (json == null) {
      console.log('ERROR: main, json:', json);
      return;
    }

    date = new Date(json.addedBikes[0].updated);

    const rawStations = json.addedStations;
    generateStations(rawStations);
  });

  helper.createDirectory(outputFolder);

  helper.writeJsonFile(outputPathData, data);

  console.log('INFO: main: Done!');
};

const generateStations = function(rawStations) {
  rawStations.forEach(function(rawStation) {
    const existingStation = findStation(rawStation.id, data);

    if (existingStation) {
      updateStation(rawStation, existingStation);
    } else {
      createStation(rawStation);
    }
  });
};

const findStation = function(stationId, data) {
  // console.log('mvgstate-station.findStation, stationID:', stationID);
  if (data === null || data === undefined) {
    console.log('ERROR: findStation, data:', data);
    return null;
  }

  return data.find(function(station) {
    return station.stationId === stationId;
  });
};

const createStation = function(rawData) {
  const station = newStation(rawData);
  if (station === null) {
    console.log('ERROR: createStation, station: null');
    return;
  }

  data.push(station);
};

const updateStation = function(rawStation, existingStation) {
  const index = data.findIndex(function(station) {
    return station.id === existingStation.id;
  });

  data[index].lastAppearanceDate = date;
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
    firstAppearanceDate: date,
    lastAppearanceDate: date,
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

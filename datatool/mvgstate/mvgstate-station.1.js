/**
 * station
 *
 */
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');

const outputFolder = 'output';
const dataFileName = 'mvgStation.json';

let data = null;
let input = '';
let date = null;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
  const json = JSON.parse(input);
  // console.log(input);
  // console.log(json);

  const rawStations = json.addedStations;
  date = new Date(json.addedBikes[0].updated);

  const outputPathData = outputFolder + '/' + dataFileName;

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  data = loadJsonFile(outputPathData);

  generateStations(rawStations);
  
  writeJsonFile(outputPathData, data);

  console.log('mvgstate-station: Done!');
});

const loadJsonFile = function(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(
      'mvgstate-station.loadJsonFile: No ' +
        filePath +
        ' file creating new one.'
    );
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.log('mvgstate-station.loadJsonFile, error: ', error);
    throw error;
  }
};

const writeJsonFile = function(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
  } catch (error) {
    console.log('mvgstate-station.writeJsonFile, error', error);
    throw error;
  }
};

const generateStations = function(rawStations) {
  const count = rawStations.length;
  for (let index; index < count; index++) {
    const rawStation = rawStations[index];
    // console.log('generateStations, rawData:', rawData);

    const existingStation = findStation(rawStation.id, data);
    // console.log('generateStations, station:', station);

    if (existingStation === null || existingStation === undefined) {
      createStation(rawStation);
    } else {
      updateStation(rawStation, existingStation);
    }
  }
};

const findStation = function(stationID, data) {
  if (data === null || data === undefined) {
    console.log('mvgstate-station.findStation, data: null or undefined');
    return null;
  }

  return data.find(function(station) {
    return station.stationID === stationID;
  });
};

const createStation = function(rawData) {
  const station = newStation(rawData);
  if (station === null) {
    console.log('ERROR mvgstate-station.createStation, station: null');
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
    console.log(
      'ERROR: mvgstate-station.newStation, rawData: null or undefined'
    );
    return null;
  }

  let station = {};

  station.id = uuidv4();
  station.stationId = rawStation.id;
  station.loc = {
    type: 'Point',
    coordinates: [rawStation.longitude, rawStation.latitude]
  };
  station.firstAppearanceDate = date;
  station.lastAppearanceDate = date;

  let additionalData = {};
  additionalData.provider = rawStation.provider;
  additionalData.stationName = rawStation.name;
  //additionalData.bikeRacks = rawData.?; // TODO where to get?
  additionalData.district = rawStation.district;

  station.additionalData = additionalData;

  return station;
};

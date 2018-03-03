/**
 * stationtopoint
 *
 */
'use strict';

const helper = require('./../share/helper');

const path = require('path');

const outputFolder = 'output';
const dataFileName = 'mvgHaltsAsLines.geojson';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let input = '';
process.stdin.on('data', function(chunk) {
  input = input + chunk;
});

process.stdin.on('end', function() {
  const json = JSON.parse(input);
  if (json.constructor != Array) {
    console.log('ERROR: process.stdin.on, json is no array');
    return;
  }

  let haltsOfBikes = {};
  json.forEach(halt => {
    if (haltsOfBikes.hasOwnProperty(halt.bikeNumber)) {
      haltsOfBikes[halt.bikeNumber] = updateGeojsonLineString(
        haltsOfBikes[halt.bikeNumber],
        halt
      );
    } else {
      haltsOfBikes[halt.bikeNumber] = newGeojsonLineString(halt);
    }
  });

  const output = {
    type: 'FeatureCollection',
    features: []
  };

  // console.log(haltsOfBikes);
  for (const bikeNumber in haltsOfBikes) {
    if (haltsOfBikes.hasOwnProperty(bikeNumber)) {
      const geojsonFeature = haltsOfBikes[bikeNumber];

      if (geojsonFeature.geometry.coordinates.length > 2) {
        output.features.push(geojsonFeature);
      }
    }
  }

  const outputPath = path.join(outputFolder, dataFileName);

  helper.createDirectory(outputFolder);
  helper.writeJsonFile(outputPath, output);

  console.log('INFO: preprocess halttoline, Done!');
});

const newGeojsonLineString = function(halt) {
  const geojsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      // check coordinates if zero and skip those
      coordinates:
        halt.loc.coordinates[0] === 0 && halt.loc.coordinates[1] === 0
          ? []
          : [halt.loc.coordinates]
      // coordinates: [halt.loc.coordinates]
    },
    properties: {
      bikeNumber: halt.bikeNumber,
      provider: halt.provider,
      startDate: halt.startDate,
      endDate: halt.endDate,
      driveStartDates: [halt.endDate],
      driveEndDates: []
    }
  };

  return geojsonFeature;
};

const updateGeojsonLineString = function(geojsonFeature, halt) {
  // console.log('updateGeojsonLineString, geojsonFeature:', geojsonFeature);

  // check coordinates if zero and skip those
  if (halt.loc.coordinates[0] !== 0 && halt.loc.coordinates[1] !== 0) {
    geojsonFeature.geometry.coordinates.push(halt.loc.coordinates);
  }
  geojsonFeature.properties.endDate = halt.endDate;
  geojsonFeature.properties.driveStartDates.push(halt.endDate);
  geojsonFeature.properties.driveEndDates.push(halt.startDate);

  // console.log('updateGeojsonLineString, geojsonFeature:', geojsonFeature);
  return geojsonFeature;
};

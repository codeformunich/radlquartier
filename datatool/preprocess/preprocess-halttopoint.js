/**
 * stationtopoint
 *
 */
'use strict';

const helper = require('./../share/helper');

const path = require('path');

const outputFolder = 'output';
const dataFileName = 'mvgHalts.geojson';

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

  const output = {
    type: 'FeatureCollection',
    features: json.map(haltToGeojsonFeature)
  };

  const outputPath = path.join(outputFolder, dataFileName);

  helper.createDirectory(outputFolder);
  helper.writeJsonFile(outputPath, output);

  console.log('INFO: preprocess, Done!');
});

const haltToGeojsonFeature = function(halt) {
  const geojsonFeature = {
    type: 'Feature',
    geometry: halt.loc,
    properties: {
      id: halt.id,
      bikeNumber: halt.bikeNumber,
      provider: halt.provider,
      startDate: halt.startDate,
      endDate: halt.endDate,
      count: halt.count,
      // stationId: halt.stationId,
      // district: halt.district
    }
  };

  return geojsonFeature;
};

/**
 * preprocess-tosvg
 *
 */
'use strict';

const program = require('commander');
const path = require('path');
const d3 = require('d3');

const helper = require('./../share/helper');


const outputFolder = 'output';
const dataFileName = 'mvgRides.csv';
// const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const file = args[0];

helper.readJsonFile(file).then(json => {
  const rides = [...helper.PairsToMap(json).values()];
  const csv = d3.csvFormat(rides);

  const outputPathData = path.join(outputFolder, dataFileName);

  helper.writeFile(outputPathData, csv);
});

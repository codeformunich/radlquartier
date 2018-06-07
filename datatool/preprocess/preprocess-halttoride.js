/**
 * preprocess-halttoride
 *
 */
'use strict';

const program = require('commander');

const CountHalts = require('./CountHalts');

const outputFolder = 'output/ride';
const tempFileName = 'mvgRidesTemp.json';
const dataFileName = 'mvgRides.json';
const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const haltParser = new CountHalts(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltParser.parse(args[0]);
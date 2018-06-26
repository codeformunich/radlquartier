/**
 * preprocess-halttoride
 *
 */
'use strict';

const program = require('commander');

const HaltToRide = require('./HaltToRide');

const outputFolder = 'output';
const tempFileName = 'mvgRidesTemp.json';
const dataFileName = 'mvgRides.json';
const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const haltToRide = new HaltToRide(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltToRide.parse(args[0]);
/**
 * station
 *
 */
'use strict';

const program = require('commander');

const MvgstateStationParser = require('./MvgstateStationParser');

const outputFolder = 'output';
const tempFileName = 'mvgStateStationTemp.json';
const dataFileName = 'mvgStateStation.json';
const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const haltParser = new MvgstateStationParser(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltParser.parse(args[0]);


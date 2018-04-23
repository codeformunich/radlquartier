/**
 * mvgstate-halt
 *
 */
'use strict';

const program = require('commander');

const MvgstateHaltParser = require('./MvgstateHaltParser');

const outputFolder = 'output';
const tempFileName = 'mvgStateHaltsTemp.json';
const dataFileName = 'mvgStateHalts.json';
const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const haltParser = new MvgstateHaltParser(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltParser.parse(args[0]);

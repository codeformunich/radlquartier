/**
 * mvgstate-halt
 *
 */
'use strict';

const program = require('commander');

const HaltParser = require('./HaltParser');

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateHalts.json';
const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const haltParser = new HaltParser(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltParser.parse(args[0]);

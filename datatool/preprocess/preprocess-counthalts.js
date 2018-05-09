/**
 * preprocess-counthalts
 *
 */
'use strict';

const program = require('commander');

const CountHalts = require('./CountHalts');

const outputFolder = 'output';
const tempFileName = 'countHaltsTemp.json';
const dataFileName = 'countHalts.json';
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
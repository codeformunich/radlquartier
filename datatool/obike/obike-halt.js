/**
 * obike-halt
 *
 */
'use strict';

const program = require('commander');

const HaltParser = require('./HaltParser');

const outputFolder = 'output';
const tempFileName = 'obikeTemp.json';
const dataFileName = 'obikeHalts.json';
const provider = 'OBIKE';

program.parse(process.argv);
const args = program.args;

const haltParser = new HaltParser(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltParser.parse(args[0]);

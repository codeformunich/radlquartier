/**
 * obike-halt
 *
 */
'use strict';

const program = require('commander');

const ObikeHaltParser = require('./ObikeHaltParser');

const outputFolder = 'output';
const tempFileName = 'obikeTemp.json';
const dataFileName = 'obikeHalts.json';
const provider = 'OBIKE';

program.parse(process.argv);
const args = program.args;

const haltParser = new ObikeHaltParser(
  outputFolder,
  tempFileName,
  dataFileName,
  provider
);
haltParser.parse(args[0]);

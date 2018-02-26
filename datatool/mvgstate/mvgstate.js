#!/usr/bin/env node

/**
 * Require dependancy
 *
 */
const program = require('commander');
const pkg = require('./../../package.json');

program
  .version(pkg.version)
  .command(
    'station',
    'creates stations from the raw bike data from the networkstate-mvgrad files: : mvgstate station < input,json'
  )
  .command(
    'bike',
    'creates bikess from the raw bike data from the networkstate-mvgrad files: : mvgstate bike < input,json'
  )
  .command(
    'halt',
    'mvgstate halt "directory with json files" - creates halts from the raw bike data from the networkstate-mvgrad files'
  )
  .command(
    'ride',
    'creates rides from the raw bike data from the networkstate-mvgrad files: : mvgstate ride < input,json'
  )
  // .command('importstations', 'imports the station data from the networkstate-mvgrad files and add a timestamp' )
  .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

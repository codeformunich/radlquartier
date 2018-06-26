#!/usr/bin/env node

/**
 * Require dependencies
 *
 */
const program = require('commander');
const pkg = require('./../../package.json');

program
  .version(pkg.version)
  .command(
    'station',
    'creates stations from the raw data from the networkstate-mvgrad files: mvgstate station <path>'
  )
  .command(
    'halt',
    'creates halts from the raw data from the networkstate-mvgrad files: mvgstate halt <path>'
  )
  .parse(process.argv);

// console.log('program.directory:', program.directory);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

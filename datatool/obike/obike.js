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
    'creates stations from the raw bike data from the networkstate-mvgrad files: mvgstate station [directory]'
  )
  .command(
    'halt',
    'creates halts from the raw bike data from the networkstate-mvgrad files: mvgstate halt [directory]'
  )
  .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

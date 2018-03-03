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
    'halt',
    'creates halts from the raw bike data from the obkie files: obkie halt [directory]'
  )
  .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

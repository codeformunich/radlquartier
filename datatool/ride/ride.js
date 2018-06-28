#!/usr/bin/env node
'use strict';

/**
 * Require dependencies
 *
 */
const program = require('commander');
const pkg = require('./../../package.json');

program
  .version(pkg.version)
  .command(
    'fromhalt',
    'create rides from halts: ride fromhalt <file>'
  )
  .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

#!/usr/bin/env node
/*jshint node:true */
'use strict';

/**
 * Require dependencies
 *
 */
const program = require('commander'),
    pkg = require('./package.json');

program
    .version(pkg.version)
    .command('importrawdata', 'imports the raw bike data from the networkstate-mvgrad files')
    .command('importstations', 'imports the station data from the networkstate-mvgrad files and add a timestamp' )
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

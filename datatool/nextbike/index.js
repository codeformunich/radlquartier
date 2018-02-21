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
    .command('xml2json', 'converts xml to json: nextbike xml2json < input.xml > output.json' )
    .command('extractplace', 'extracts palce element from json: nextbike extractplace < input.json > output.json')
    .command('adddate <date>', 'extends the place json objects with a date: nextbike adddate "date" < input.json > output.json' )
    .command('bike', 'extracts all bikes from the place data')
    .command('station', 'extracts all stations from the place data')
    .command('ride', 'extracts all rides from the place data')
    .command('halt', 'extracts all hats drom the place data')
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

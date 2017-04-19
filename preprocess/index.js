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
    // .command('station', 'extracts only the stations from all places: ivdata station < input.json > output.json' )
    .command('geojson', 'transforms place elments in a geojson file')
    .command('halt', 'loads place data from the DB and transfroms and aggregates them to data for the map view')
    .command('linestring <bike>','cretaes a geojson linestring')
    .command('chorddata', 'loads places data from the DB and aggregates them to data for the chord view')
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

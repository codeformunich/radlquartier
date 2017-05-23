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
    .command('coorswitch','switch coordinats in a geojson file')
    .command('geojson', 'transforms place elments in a geojson file')
    .command('linestring <bike>','cretaes a geojson linestring')
    .command('chorddata', 'loads places data from the DB and aggregates them to data for the chord view')
    .command('quartier','halts per destrict')
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

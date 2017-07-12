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
    .command('coorswitch', 'switch coordinats in a geojson file')
    .command('geojson', 'transforms place elments in a geojson file')
    .command('linestring <bike>','cretaes a geojson linestring: node index.js linestring 96300 > bike96300.json')
    .command('chorddata', 'loads places data from the DB and aggregates them to data for the chord view')
    .command('quartier', 'number of halts per district: node index.js quartier < ../geojson/munich.geojson > district.json')
    .command('qhs', 'halts statistic per district: node index.js preprocess qh < ../geojson/munich.geojson')
    .command('qhc', 'coordinates of halts per destrict: node index.js haltcoor < ../geojson/munich.geojson')
    .command('stations', 'extract stations as geojson from a "networkstate"-file: preprocess stations < networkstate.json')
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

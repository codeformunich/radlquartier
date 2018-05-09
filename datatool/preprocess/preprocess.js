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
    'halttopoint',
    'transform halt elements to geojson Point: preprocess halttopoint < halts.json'
  )
  .command(
    'halttoline',
    'transform halt elements to geojson LineString: preprocess halttoline < halts.json'
  )
  .command(
    'stationtopoint',
    'transform station elements to geojson Point: preprocess halttopoint < stations.json'
  )
  .command(
    'counthalts',
    'create halts statistics count halts per hour: preprocess counthalts [directory]'
  )

  // .command('coorswitch', 'switch coordinats in a geojson file')
  // .command(
  //   'linestring <bike>',
  //   'cretaes a geojson linestring: node index.js linestring 96300 > bike96300.json'
  // )
  // .command(
  //   'chorddata',
  //   'loads places data from the DB and aggregates them to data for the chord view'
  // )
  // .command(
  //   'quartier',
  //   'number of halts per district: node index.js quartier < ../geojson/munich.geojson > district.json'
  // )
  // .command(
  //   'qhs',
  //   'halts statistic per district: node index.js qh < ../geojson/munich.geojson'
  // )
  // .command(
  //   'qhc',
  //   'coordinates of halts per destrict: node index.js qhc < ../geojson/munich.geojson'
  // )
  // .command('qhca', 'all coordinates of halts: node index.js qhca')
  // .command(
  //   'stations',
  //   'extract stations as geojson from a "networkstate"-file: preprocess stations < networkstate.json'
  // )
  .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

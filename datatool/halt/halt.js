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
  // .command(
  //   'halttopoint',
  //   'transform halt elements to geojson Point: preprocess halttopoint < halts.json'
  // )
  // .command(
  //   'halttoline',
  //   'transform halt elements to geojson LineString: preprocess halttoline < halts.json'
  // )
  // .command(
  //   'stationtopoint',
  //   'transform station elements to geojson Point: preprocess halttopoint < stations.json'
  // )
  // .command(
  //   'counthalts',
  //   'create halts statistics count halts per hour: preprocess counthalts <directory>'
  // )
  .command(
    'countperhour',
    'create halts statistics count halts per hour of day: halt countperhour <file>'
  )
  .command(
    'countperweekday',
    'create halts statistics count halts per day of week: halt countperweekday <file>'
  )
  .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();

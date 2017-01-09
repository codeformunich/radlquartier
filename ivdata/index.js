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
    .command('xml2json', 'converts xml to json: ivdata xml2json < input.xml > output.json' )
    .command('extractplace', 'extracts palce element from json: ivdata extractplace < input.json > output.json')
    .command('adddate <date>', 'extends the place json objects with a date: ivdata adddate "date" < input.json > output.json' )
    // .command('station', 'extracts only the stations from all places: ivdata station < input.json > output.json' )
    .command('geojson', 'transforms place elments in a geojson file')
    .command('mapdata', 'loads place data from the DB and transfroms and aggregates them to data for the map view')
    .command('linestring <bike>','cretaes a geojson linestring')
    .command('chorddata', 'loads places data from the DB and aggregates them to data for the chord view')
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();





// #!/usr/bin/env node
// 'use strict';

// const program = require('commander'),
// 	pkg = require('./package.json');

// console.log('Hello, world!');

// program
//     .version(pkg.version)
//     .command('list [directory]')
//     .option('-a, --all', 'List all')
//     .option('-l, --long','Long list format')
//     .action(list);

// program.parse(process.argv);

// // if program was called with no arguments, show help.
// if (program.args.length === 0) program.help();

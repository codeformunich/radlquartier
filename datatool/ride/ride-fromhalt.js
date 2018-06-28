/**
 * ride-fromhalt
 *
 */
'use strict';

const program = require('commander');
const path = require('path');
const d3 = require('d3');

const helper = require('./../share/helper');
const Ride = require('./../share/Ride');

const outputFolder = 'output';
const outputFile = 'rides';
// const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const input = args[0];

helper.readJsonFile(input).then(json => {
  if (!json) {
    throw new Error('json:', json);
  }

  const halts = [...helper.PairsToMap(json).values()];
  halts.sort(function(a, b) {
    return new Date(a.startDate) - new Date(b.startDate);
  });

  let bikesHalts = new Map();
  for (const halt of halts) {
    if (bikesHalts.has(halt.bikeNumber)) {
      let tempHalts = bikesHalts.get(halt.bikeNumber);
      tempHalts.push(halt);
      bikesHalts.set(halt.bikeNumber, tempHalts);
    } else {
      bikesHalts.set(halt.bikeNumber, [halt]);
    }
  }

  let zeroCount = 0;
  let distanceCount = 0;
  let durationCount = 0;
  let rideCount = 0;
  let outputData = new Map();

  for (const bikeHalts of bikesHalts.values()) {
    // console.log('bikeHalts',bikeHalts);

    // const tempHalts = [...bikeHalts.values()];

    // filter 0,0 coordinates
    const halts = bikeHalts.filter(function(halt) {
      if (halt.longitude !== 0 && halt.longitude !== 0) {
        return true;
      }

      zeroCount += 1;
      return false;
    });

    halts.sort(function(a, b) {
      return new Date(a.startDate) - new Date(b.startDate);
    });

    for (let index = 0; index < halts.length; index++) {
      if (index + 1 === halts.length) {
        continue;
      }

      const start = halts[index];
      const end = halts[index + 1];

      const ride = new Ride(
        start.bikeNumber,
        start.id,
        end.id,
        start.longitude,
        start.latitude,
        end.longitude,
        end.latitude,
        start.endDate,
        end.startDate,
        start.provider
      );

      // filter rides with no distance or negative duration
      // not quite sure where negative duration comes from
      if (ride.distance === 0) {
        distanceCount += 1;
        continue;
      }
      if (ride.duration < 0) {
        // console.log('ride.duration', ride.duration);
        durationCount += 1;
        continue;
      }

      rideCount += 1;
      outputData.set(ride.id, ride);
    }
  }
  console.log('zeroCount', zeroCount);
  console.log('distanceCount', distanceCount);
  console.log('durationCount', durationCount);
  console.log('rideCount', rideCount);

  const outputPathJson = path.join(outputFolder, outputFile + '.json');
  helper.writeJsonFile(outputPathJson, helper.MapToPairs(outputData));

  const csv = d3.csvFormat([...outputData.values()]);
  const outputPathCsv = path.join(outputFolder, outputFile + '.csv');
  helper.writeFile(outputPathCsv, csv);
});

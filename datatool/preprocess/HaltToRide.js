/**
 * HaltToRide
 *
 */

const DataParserJson = require('./../share/DataParserJson');
const helper = require('./../share/helper');
const Ride = require('./../share/ride');

class HaltToRide extends DataParserJson {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    super(outputFolder, tempFileName, dataFileName, provider);
  }

  processData(filename, json) {
    if (!json) {
      throw new Error('processData, json:', json);
    }

    const halts = [...helper.PairsToMap(json).values()];

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

    for (const bikeHalts of bikesHalts.values()) {
      // console.log('bikeHalts',bikeHalts);

      // const tempHalts = [...bikeHalts.values()];

      // filter 0,0 coordinates
      const halts = bikeHalts.filter(function(halt) {
        return halt.longitude !== 0 && halt.longitude !== 0;
      });


      // halts.sort(function(a, b) {
      //   return new Date(a.startDate) - new Date(b.startDate);
      // });

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
        if ( ride.distance === 0 || ride.duration < 0 ) {
          continue;
        }

        this.outputData.set(ride.id, ride);
      }
    }
    // const key =
    //   this.floorDateToHour(halt.endDate) +
    //   '_' +
    //   halt.loc.coordinates[0] +
    //   '_' +
    //   halt.loc.coordinates[1];

    // if (this.outputData.has(key)) {
    //   let count = this.outputData.get(key);
    //   this.outputData.set(key, count + 1);
    // } else {
    //   this.outputData.set(key, 1);
    // }
  }

  // floorDateToHour(date) {
  //   const hourDate = date.slice(0, 13) + ':00:00.000Z';
  //   return hourDate;
  // }
}

module.exports = HaltToRide;

/**
 * halt
 *
 */

const uuidv4 = require('uuid/v4');
const turf = require('@turf/turf');

class Ride {
  constructor(
    bikeNumber,
    startId,
    endId,
    startLongitude,
    startLatitude,
    endLongitude,
    endLatitude,
    startDate,
    endDate,
    provider
  ) {
    this.id = uuidv4();
    this.bikeNumber = bikeNumber;
    this.startId = startId;
    this.endId = endId;
    this.startLongitude = startLongitude;
    this.startLatitude = startLatitude;
    this.endLongitude = endLongitude;
    this.endLatitude = endLatitude;
    this.startDate = startDate;
    this.endDate = endDate;
    this.provider = provider;
    this.duration = (new Date(endDate) - new Date(startDate)) / 1000;

    const from = turf.point([startLongitude, startLatitude]);
    const to = turf.point([endLongitude, endLatitude]);
    const options = { units: 'kilometers' };

    this.distance = Math.trunc(turf.distance(from, to, options) * 1000);
  }
}

module.exports = Ride;

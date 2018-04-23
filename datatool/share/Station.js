/**
 * halt
 *
 */

const uuidv4 = require('uuid/v4');

class Station {
  constructor(
    stationId,
    longitude,
    latitude,
    firstAppearanceDate,
    lastAppearanceDate,
    provider,
    stationName,
    district
  ) {
    this.id = uuidv4();
    this.stationId = stationId;
    this.loc = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    this.firstAppearanceDate = firstAppearanceDate;
    this.lastAppearanceDate = lastAppearanceDate;
    this.additionalData = {
      provider: provider,
      stationName: stationName,
      district: district // TODO do we want it?
      // bikeRacks: rawStation.?, // TODO where to get?
    };
  }
}

module.exports = Station;

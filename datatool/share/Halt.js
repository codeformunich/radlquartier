/**
 * halt
 *
 */

const uuidv4 = require('uuid/v4');

class Halt {
  constructor(
    bikeNumber,
    longitude,
    latitude,
    startDate,
    endDate,
    provider,
    count,
    additionalData
  ) {
    this.id = uuidv4();
    this.bikeNumber = bikeNumber;
    this.longitude = longitude;
    this.latitude = latitude;
    // this.loc = {
    //   type: 'Point',
    //   coordinates: [longitude, latitude]
    // };
    this.startDate = startDate;
    this.endDate = endDate;
    this.additionalData = {
      provider: provider,
      count: count
    };

    if (additionalData) {
      additionalData.forEach(element => {
        this.additionalData[element[0]] = element[1];
      });
    }
  }
}

module.exports = Halt;

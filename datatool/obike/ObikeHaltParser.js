/**
 * ObikeHaltParser
 *
 */

const HaltParser = require('./../share/HaltParser');

class ObikeHaltParser extends HaltParser {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    super(outputFolder, tempFileName, dataFileName, provider);
  }

  processData(filename, json) {
    if (!json) {
      throw new Error('processData, json:', json);
    }

    // possible file names are:
    // - muc-2017-09-07T12:40:22+0200.json
    // - muc-2017-09-07T23:55:19+0200-11.37267149695314-48.16890050781732.json
    // - muc-2017-09-07T12_40_22+0100.json
    const regex = /muc-(.+?\+\d+)/;

    const date = regex.exec(filename)[1].replace(/_/g, ':');

    const bikes = json.data.list;
    if (!bikes) {
      throw new Error('processData, bikes:', bikes);
    }

    bikes.forEach(function(bike) {
      const lastHalt = this.tempData.get(bike.id);

      if (
        lastHalt &&
        lastHalt.longitude === bike.longitude &&
        lastHalt.latitude === bike.latitude
      ) {
        this.updateHalt({
          lastHalt: lastHalt,
          endDate: new Date(date)
        });
      } else {
        this.createHalt({
          bikeNumber: bike.id,
          longitude: bike.longitude,
          latitude: bike.latitude,
          date: new Date(date),
          provider: this.provider,
          additionalData: null
          // TODO? additional obike 2017 data we currenlty ignore
          //   imei:6C697A6174346F6E
          //   iconUrl:null
          //   promotionActivityType:null
          //   rideMinutes:null
          //   countryId:60
          //   helmet:0
        });
      }
    }, this);
  }
}

module.exports = ObikeHaltParser;

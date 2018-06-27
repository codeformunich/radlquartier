/**
 * HaltParser
 *
 */

const DataParserJson = require('./../share/DataParserJson');
const Halt = require('./halt');

class HaltParser extends DataParserJson {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    super(outputFolder, tempFileName, dataFileName, provider);
  }

  /**
   *
   * @param {*} filename
   * @param {*} json
   */
  processData(filename, json) {
    console.log('processData, filename:', filename);
    console.log('processData, json:', json);

    throw new Error('processData, needs to be implemented by child class');

    // if (!json) {
    //   throw new Error('processData, json:', json);
    // }

    // const bikes = json.addedBikes;
    // if (!bikes) {
    //   throw new Error('processData, bikes:', bikes);
    // }

    // bikes.forEach(function(bike) {
    //   console.log('generateHalts, filename', filename);

    //   rawBikes.forEach(function(rawBike) {
    //     const lastExistingHalt = this.tempData.get(rawBike.bikeNumber);

    //     if (
    //       lastExistingHalt &&
    //       lastExistingHalt.loc.coordinates[0] === rawBike.longitude &&
    //       lastExistingHalt.loc.coordinates[1] === rawBike.latitude
    //     ) {
    //       this.updateHalt(rawBike, lastExistingHalt);
    //     } else {
    //       this.createHalt(rawBike);
    //     }
    //   });
    // });
  }

  /**
   *
   * @param {*} param0
   */
  createHalt({
    bikeNumber: bikeNumber,
    longitude: longitude,
    latitude: latitude,
    date: date,
    provider: provider,
    additionalData: additionalData
  }) {
    const halt = new Halt(
      bikeNumber,
      longitude,
      latitude,
      date,
      date,
      provider,
      1,
      additionalData
    );

    if (!halt) {
      console.error('createHalt, halt: ', halt);
      return;
    }

    this.outputData.set(halt.id, halt);
    this.tempData.set(halt.bikeNumber, halt);
  }

  /**
   *
   * @param {*} param0
   */
  updateHalt({ lastHalt: lastHalt, endDate: endDate }) {
    let halt = this.outputData.get(lastHalt.id);
    if (!halt) {
      console.error('updateHalt, halt: ', halt);
      return;
    }

    halt.endDate = endDate;
    halt.count = halt.count + 1;

    this.outputData.set(halt.id, halt); // necessaire?
    this.tempData.set(halt.bikeNumber, halt);
  }
}

module.exports = HaltParser;

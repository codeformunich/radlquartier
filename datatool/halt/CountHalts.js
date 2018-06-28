/**
 * CountHalts
 *
 */

const DataParserJson = require('./../share/DataParserJson');
const helper = require('./../share/helper');

class CountHalts extends DataParserJson {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    super(outputFolder, tempFileName, dataFileName, provider);
  }

  processData(filename, json) {
    if (!json) {
      throw new Error('processData, json:', json);
    }

    const halts = [...helper.PairsToMap(json).values()];

    for (const halt of halts) {
      const key =
        this.floorDateToHour(halt.endDate) +
        '_' +
        halt.longitude +
        '_' +
        halt.latitude;

      if (this.outputData.has(key)) {
        let count = this.outputData.get(key);
        this.outputData.set(key, count + 1);
      } else {
        this.outputData.set(key, 1);
      }
    }
  }

  floorDateToHour(date) {
    const hourDate = date.slice(0, 13) + ':00:00.000Z';
    return hourDate;
  }
}

module.exports = CountHalts;

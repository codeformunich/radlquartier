/**
 * BikeDataParser
 *
 */

const path = require('path');
const cliProgress = require('cli-progress');

const helper = require('./../share/helper');
const Halt = require('./../share/halt');

class BikeDataParser {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    this.outputFolder = outputFolder;
    this.tempFileName = tempFileName;
    this.dataFileName = dataFileName;
    this.provider = provider;

    // create a new progress bar instances
    this.processDirectoryBar = new cliProgress.Bar(
      {},
      cliProgress.Presets.shades_classic
    );
    this.processDataBar = new cliProgress.Bar(
      {},
      cliProgress.Presets.shades_classic
    );
    this.processDataIndex = 0;

    this.haltData = null;
    this.tempData = null;
  }

  /**
   *
   */
  parse(inputFolder) {
    if (!inputFolder || inputFolder.length === 0) {
      console.error('main, inputFolder:', inputFolder);
      return;
    }

    const outputPathTemp = path.join(this.outputFolder, this.tempFileName);
    const outputPathData = path.join(this.outputFolder, this.dataFileName);

    helper
      .readJsonFile(outputPathTemp)
      .then(json => {
        this.tempData = helper.PairsToMap(json);

        return helper.readJsonFile(outputPathData);
      })
      .then(json => {
        this.haltData = helper.PairsToMap(json);

        return this.processDirectory(inputFolder);
      })
      .then(() => {
        // stop the progress bar
        this.processDataBar.stop();

        return helper.createDirectory(this.outputFolder);
      })
      .then(() => {
        if (this.haltData.size === 0) {
          console.error('main, haltData: empty');
          return;
        }

        return Promise.all([
          helper.writeJsonFile(
            outputPathData,
            helper.MapToPairs(this.haltData)
          ),
          helper.writeJsonFile(outputPathTemp, helper.MapToPairs(this.tempData))
        ]);
      })
      .then(() => {
        console.log('Done!');
      })
      .catch(error => {
        console.error('main, error:', error.message);
      });
  }

  /**
   *
   * @param {*} inputFolder
   */
  processDirectory(inputFolder) {
    return helper.readdir(inputFolder).then(files => {
      let promises = [];

      console.log('process directory');
      // start the progress bar with a total value of 200 and start value of 0
      this.processDirectoryBar.start(files.length, 0);

      files.forEach(function(filename, index) {
        if (path.extname(filename) !== '.json') {
          return;
        }

        // update the current value in your application..
        this.processDirectoryBar.update(index + 1);
        // console.log('processDirectory, filename:', filename);

        const filePath = path.join(inputFolder, filename);
        promises.push(
          helper.readJsonFile(filePath).then(
            json => {
              // update the current value in your application..
              this.processDataIndex += 1;
              this.processDataBar.update(this.processDataIndex);

              try {
                this.processData(filename, json);
              } catch (error) {
                console.error(
                  `processDirectory, filePath: ${filePath} error:, ${
                    error.message
                  }`
                );
                return;
              }
            },
            error => {
              console.error('processDirectory, error:', error.message);
              return;
            }
          )
        );
      }, this);

      // stop the progress bar
      this.processDirectoryBar.stop();

      console.log('process files');
      // start the progress bar with a total value of 200 and start value of 0
      this.processDataBar.start(files.length, 0);

      return Promise.all(promises);
    });
  }

  /**
   *
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
    // if (!bike) {
    //   console.error('createHalt, bike:', bike);
    //   return;
    // }

    // const date = new Date(bike.updated);

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

    this.haltData.set(halt.id, halt);
    this.tempData.set(halt.bikeNumber, halt);
  }

  /**
   *
   * @param {*} bike
   * @param {*} lastHalt
   */
  updateHalt({ lastHalt: lastHalt, endDate: endDate }) {
    let halt = this.haltData.get(lastHalt.id);
    if (!halt) {
      console.error('updateHalt, halt: ', halt);
      return;
    }

    halt.endDate = endDate;
    halt.additionalData.count = halt.additionalData.count + 1;

    this.haltData.set(halt.id, halt); // necessaire?
    this.tempData.set(halt.bikeNumber, halt);
  }
}

module.exports = BikeDataParser;

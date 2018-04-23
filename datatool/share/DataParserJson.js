/**
 * BikeDataParser
 *
 */

const path = require('path');
const cliProgress = require('cli-progress');

const helper = require('./../share/helper');
// const Halt = require('./../share/halt');

class DataParserJson {
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

    this.outputData = null;
    this.tempData = null;
  }

  /**
   *
   */
  parse(inputFolder) {
    console.log('Start...');

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
        this.outputData = helper.PairsToMap(json);

        return this.processDirectory(inputFolder);
      })
      .then(() => {
        // stop the progress bar
        this.processDataBar.stop();

        return helper.createDirectory(this.outputFolder);
      })
      .then(() => {
        if (this.outputData.size === 0) {
          console.error('main, outputData: empty');
          return;
        }

        return Promise.all([
          helper.writeJsonFile(
            outputPathData,
            helper.MapToPairs(this.outputData)
          ),
          helper.writeJsonFile(outputPathTemp, helper.MapToPairs(this.tempData))
        ]);
      })
      .then(() => {
        console.log('...Done!');
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
        // update the current value in your application..
        this.processDirectoryBar.update(index + 1);
        // console.log('processDirectory, filename:', filename);

        if (path.extname(filename) !== '.json') {
          this.processDataIndex += 1;
          return;
        }

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

  processData(filename, json) {
    console.log('processData, filename:', filename);
    console.log('processData, json:', json);

    throw new Error('processData, needs to be implemented by child class');
  }
}

module.exports = DataParserJson;

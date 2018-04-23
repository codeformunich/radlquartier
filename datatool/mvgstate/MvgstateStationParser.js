/**
 * MvgstateStationParser
 *
 */

const DataParserJson = require('./../share/DataParserJson');
const Station = require('./../share/Station');

class MvgstateStationParser extends DataParserJson {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    super(outputFolder, tempFileName, dataFileName, provider);
  }

  processData(filename, json) {
    if (!json || !json.addedBikes || json.addedBikes.length === 0) {
      throw new Error('processData, json:', json);
    }

    const date = new Date(json.addedBikes[0].updated);

    const rawStations = json.addedStations;
    if (!rawStations) {
      throw new Error('processData, rawStations:', rawStations);
    }

    rawStations.forEach(function(rawStation) {
      if (this.outputData.has(rawStation.id)) {
        this.updateStation({
          rawStation: rawStation,
          lastAppearanceDate: date
        });
      } else {
        this.createStation({
          stationId: rawStation.id,
          longitude: rawStation.longitude,
          latitude: rawStation.latitude,
          date: date,
          provider: rawStation.provider,
          stationName: rawStation.stationName,
          district: rawStation.district
        });
      }
    }, this);
  }

  createStation({
    stationId: stationId,
    longitude: longitude,
    latitude: latitude,
    date: date,
    provider: provider,
    stationName: stationName,
    district: district
  }) {
    const station = new Station(
      stationId,
      longitude,
      latitude,
      date,
      date,
      provider,
      stationName,
      district
    );
    if (!station) {
      console.error('createStation, station:', station);
      return;
    }

    this.outputData.set(station.stationId, station);
  }

  updateStation({
    rawStation: rawStation,
    lastAppearanceDate: lastAppearanceDate
  }) {
    let station = this.outputData.get(rawStation.id);
    if (!station) {
      console.error('updateStation, station: ', station);
      return;
    }

    station.lastAppearanceDate = lastAppearanceDate;

    this.outputData.set(station.stationId, station); // necessaire?
  }

  // // helper function
  // // creates new station object
  // const newStation = function(rawStation) {
  //   if (rawStation === null || rawStation === undefined) {
  //     console.log('ERROR: newStation, rawStation:', rawStation);
  //     return null;
  //   }

  //   let station = {
  //     id: uuidv4(),
  //     stationId: rawStation.id,
  //     loc: {
  //       type: 'Point',
  //       coordinates: [rawStation.longitude, rawStation.latitude]
  //     },
  //     firstAppearanceDate: currentDate,
  //     lastAppearanceDate: currentDate,
  //     additionalData: {
  //       provider: rawStation.provider,
  //       stationName: rawStation.name,
  //       // bikeRacks: rawStation.?, // TODO where to get?
  //       district: rawStation.district // TODO do we want it?
  //     }
  //   };

  //   return station;
  // };
}

module.exports = MvgstateStationParser;

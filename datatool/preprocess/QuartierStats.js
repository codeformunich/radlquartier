/**
 * MvgstateStationParser
 *
 */

const DataParserJson = require('./../share/DataParserJson');
const Station = require('./../share/Station');

class QuartierStats extends DataParserJson {
  constructor(outputFolder, tempFileName, dataFileName, provider) {
    super(outputFolder, tempFileName, dataFileName, provider);
  }

  processData(filename, json) {
    if (!json) {
      throw new Error('processData, json:', json);
    }

    const halts = [...helper.PairsToMap(json).values];

    // Todo how to count?

    

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
}

module.exports = QuartierStats;

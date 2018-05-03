/*jshint node:true */
'use strict';

const helper = require('./../share/helper');

const program = require('commander');
const path = require('path');
const fs = require('fs');
const ss = require('simple-statistics');
const turf = require('@turf/turf');

// requiremetns for mongoDB
// var MongoClient = require('mongodb').MongoClient;
// var assert = require('assert');
// var ObjectId = require('mongodb').ObjectID;
// var url = 'mongodb://localhost:27017/bikeproject';
// var inputCollection = 'halts';

const outputFolder = 'output';
const tempFileName = 'mvgStateTemp.json';
const dataFileName = 'mvgStateQuartierStats.json';

// let inputFile = null;
let output = {
  totalCount: 0,
  meanYearMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  meanWeekDays: [0, 0, 0, 0, 0, 0, 0],
  districts: []
};

program.parse(process.argv);
const args = program.args;

const main = function() {
  const inputFile = helper.loadJsonFile(args[0]);
  if (inputFile == null) {
    console.log('ERROR: main, args[0]:', args[0]);
    return;
  }
  const districts = helper.loadJsonFile(args[1]);
  if (districts == null) {
    console.log('ERROR: main, args[1]:', args[1]);
    return;
  }



  const outputPathTemp = path.join(outputFolder, tempFileName);
  const outputPathData = path.join(outputFolder, dataFileName);

  
  createForAllFeatures(inputFile, districts.features, function(result) {
    if (output.districts.length === 0) {
      console.log('ERROR main, output.districts: empty');
      return;
    }
  
    helper.createDirectory(outputFolder);
    helper.writeJsonFile(outputPathData, output);
    // helper.writeJsonFile(outputPathTemp, tempData);
  
    console.log('INFO: main: Done!');
  });
};

var createForAllFeatures = function(inputFile, features, callback) {
  // console.log('createForAllFeatures length: ', features.length);

  features.forEach(feature => {
    createMonthJson(inputFile, feature, callback);
  });
};

var createMonthJson = function(inputFile, district, callback) {
  if (district === null || district === undefined) {
    console.log('ERROR: createMonthJson, district:', district);
    return;
  }
  // console.log('createDistrictJson, name: ', feature.properties.name);

  const haltsInDistrict = turf.pointsWithinPolygon(inputFile, district);

  var collection = db.collection(inputCollection);
  collection.aggregate(
    [
      {
        $match: {
          loc: {
            $geoWithin: {
              $geometry: {
                type: feature.geometry.type,
                coordinates: feature.geometry.coordinates
              }
            }
          }
        }
      },
      {
        $project: {
          bikeNumber: '$bikeNumber',
          year: { $year: '$startDate' },
          dayOfYear: { $dayOfYear: '$startDate' },
          month: { $month: '$startDate' },
          dayOfMonth: { $dayOfMonth: '$startDate' },
          hour: { $hour: '$startDate' },
          week: { $isoWeek: '$startDate' },
          dayOfWeek: { $isoDayOfWeek: '$startDate' }
        }
      },
      {
        $group: {
          _id: {
            year: '$year',
            dayOfYear: '$dayOfYear',
            month: '$month',
            dayOfMonth: '$dayOfMonth',
            week: '$week',
            dayOfWeek: '$dayOfWeek'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.dayOfYear': 1 }
      }
    ],
    function(err, results) {
      assert.equal(err, null);
      // console.log('createDistrictJson, results: ', results);

      var districtData = {
        name: feature.properties.NAME,
        id: Number(feature.properties.SB_NUMMER),
        totalCount: 0,
        meanYears: 0,
        meanMonth: 0,
        meanYearMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        meanWeeks: 0,
        meanWeekDays: [0, 0, 0, 0, 0, 0, 0],
        meanDays: 0,
        data: {}
      };

      var data = {
        years: [],
        yearMonth: [[], [], [], [], [], [], [], [], [], [], [], []],
        month: [],
        weeks: [],
        weekDays: [[], [], [], [], [], [], []],
        days: []
      };

      var details = [];

      var yearCount = -1;
      var resultcount = results.length;
      for (var i = 0; i < resultcount; i++) {
        var result = results[i];

        if (result._id.year == 2016 && result._id.month == 6) {
          continue;
        }

        if (result._id.year == 2017 && result._id.month == 7) {
          continue;
        }

        if (
          details.length === 0 ||
          details[yearCount].date.year !== result._id.year
        ) {
          details.push(
            newYear(
              result._id.year,
              result._id.month,
              result._id.week,
              result._id.dayOfYear
            )
          );

          yearCount++;
        }

        districtData.totalCount += result.count;
        output.totalCount += result.count;

        // details
        details[yearCount].date.lastMonth = result._id.month;
        details[yearCount].date.lastWeek = result._id.week;
        details[yearCount].date.lastDayOfYear = result._id.dayOfYear;

        details[yearCount].totalCount += result.count;
        details[yearCount].month[result._id.month - 1] += result.count;
        details[yearCount].weeks[result._id.week - 1] += result.count;
        details[yearCount].weekDays[result._id.dayOfWeek - 1].push(
          result.count
        );
        details[yearCount].days.push(result.count);
      }

      // fill data
      for (var j = 0; j <= yearCount; j++) {
        var year = details[j];
        // console.log('callc means, year:', yearCount, year.date.year);

        data.years.push(year.totalCount);

        for (var m = 0; m < 12; m++) {
          // console.log('year.date: ', year.date);
          if (j === 0 && m < year.date.firstMonth - 1) {
            continue;
          }

          if (j === yearCount && m >= year.date.lastMonth) {
            continue;
          }

          data.yearMonth[m].push(year.month[m]);
          data.month.push(year.month[m]);
        }

        for (var w = 0; w < 53; w++) {
          if (j === 0 && w <= year.date.firstWeek) {
            continue;
          }

          if (j === yearCount && w > year.date.lastWeek) {
            continue;
          }

          data.weeks.push(year.weeks[w]);
        }

        for (var wd = 0; wd < 7; wd++) {
          data.weekDays[wd] = data.weekDays[wd].concat(year.weekDays[wd]);
        }

        data.days = data.days.concat(year.days);
      }

      // districtData.data = data;

      // calculate means
      districtData.meanYears = ss.mean(data.years);
      districtData.meanMonth = ss.mean(data.month);

      for (var l = 0; l < 12; l++) {
        if (data.yearMonth[l].length === 0) {
          districtData.meanYearMonth[l] = 0;
        } else if (data.yearMonth[l].length === 1) {
          districtData.meanYearMonth[l] = data.yearMonth[l][0];
        } else {
          districtData.meanYearMonth[l] = ss.mean(data.yearMonth[l]);
        }

        if (output.districts.length === 0) {
          output.meanYearMonth[l] = districtData.meanYearMonth[l];
        } else {
          output.meanYearMonth[l] = ss.addToMean(
            output.meanYearMonth[l],
            output.districts.length,
            districtData.meanYearMonth[l]
          );
        }
      }

      districtData.meanWeeks = ss.mean(data.weeks);

      for (var k = 0; k < 7; k++) {
        if (data.weekDays[k].length === 0) {
          districtData.meanWeekDays[k] = 0;
        } else if (data.weekDays[k].length === 1) {
          districtData.meanWeekDays[k] = data.weekDays[k][0];
        } else {
          districtData.meanWeekDays[k] = ss.mean(data.weekDays[k]);
        }

        if (output.districts.length === 0) {
          output.meanWeekDays[k] = districtData.meanWeekDays[k];
        } else {
          output.meanWeekDays[k] = ss.addToMean(
            output.meanWeekDays[k],
            output.districts.length,
            districtData.meanWeekDays[k]
          );
        }
      }

      districtData.meanDays = ss.mean(data.days);

      output.districts.push(districtData);
      callback();
    }
  );
};

// var arrayFilterNotZero = function(array) {
//   return array.filter(function(value) {
//     return value !== 0;
//   });
// };

var newYear = function(year, month, week, dayOfYear) {
  var newYear = {
    date: {
      year: year,
      firstMonth: month,
      firstWeek: week,
      firstDayOfYear: dayOfYear,
      lastmonth: month,
      lastWeek: week,
      lastDayOfYear: dayOfYear
    },
    totalCount: 0,

    meanMonth: 0,
    meanWeeks: 0,
    meanWeekDays: [0, 0, 0, 0, 0, 0, 0],
    meanDays: 0,

    month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    weeks: [],
    weekDays: [[], [], [], [], [], [], []],
    days: []
  };

  for (var i = 0; i < 53; i++) {
    newYear.weeks.push(0);
  }

  return newYear;
};

main();
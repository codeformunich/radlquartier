/**
 * halt-countperweekday
 *
 */
'use strict';

const program = require('commander');
const path = require('path');
const moment = require('moment');
const d3 = require('d3');

const helper = require('./../share/helper');
const CountByWeekDay = require('./../share/HaltPerWeekDay');

const outputFolder = 'output';
const outputFile = 'haltsPerWeekDay';
// const provider = 'MVG_RAD';

program.parse(process.argv);
const args = program.args;

const file = args[0];

helper.readJsonFile(file).then(json => {
  if (!json) {
    throw new Error('json:', json);
  }

  const halts = [...helper.PairsToMap(json).values()];
  halts.sort(function(a, b) {
    return new Date(a.startDate) - new Date(b.startDate);
  });

  let outputData = new Map();
  for (const halt of halts) {
    const date = moment(halt.startDate);

    const keyDate = halt.startDate.slice(0, 5) + 'KW' + date.isoWeek();
    const keyDay = 'weekDay' + date.isoWeekday();

    let countByWeekDay = outputData.has(keyDate)
      ? outputData.get(keyDate)
      : new CountByWeekDay(keyDate);
    countByWeekDay[keyDay] += 1;

    // console.log('countByHour',countByHour);
    outputData.set(keyDate, countByWeekDay);
  }

  const outputPathData = path.join(outputFolder, outputFile + '.json');
  helper.writeJsonFile(outputPathData, helper.MapToPairs(outputData));

  const csv = d3.csvFormat([...outputData.values()]);
  const outputPathCsv = path.join(outputFolder, outputFile + '.csv');
  helper.writeFile(outputPathCsv, csv);
});

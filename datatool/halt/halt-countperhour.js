/**
 * halt-countperhour
 *
 */
'use strict';

const program = require('commander');
const path = require('path');
const d3 = require('d3');

const helper = require('./../share/helper');
const CountByHour = require('../share/HaltPerHour');

const outputFolder = 'output';
const outputFile = 'haltsPerHourOfDay';
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
    const keyDate = halt.startDate.slice(0, 10);
    const keyHour = 'hour' + halt.startDate.slice(11, 13);

    let countByHour = outputData.has(keyDate)
      ? outputData.get(keyDate)
      : new CountByHour(keyDate);
    countByHour[keyHour] += 1;

    // console.log('countByHour',countByHour);
    outputData.set(keyDate, countByHour);
  }

  const outputPathJson = path.join(outputFolder, outputFile + '.json');
  helper.writeJsonFile(outputPathJson, helper.MapToPairs(outputData));

  const csv = d3.csvFormat([...outputData.values()]);
  const outputPathCsv = path.join(outputFolder, outputFile + '.csv');
  helper.writeFile(outputPathCsv, csv);
});

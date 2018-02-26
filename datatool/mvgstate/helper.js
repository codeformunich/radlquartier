/**
 * helper
 *
 */
'use strict';

const fs = require('fs');

exports.createDirectory = function (directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

exports.readDirectory = function (directory) {
  try {
    return fs.readdirSync(directory);
  } catch (error) {
    console.log('helper.readDirectory, error', error);
    throw error;
  }
};

exports.loadJsonFile = function (filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.log('helper.loadJsonFile, error: ', error);
    throw error;
  }
};

exports.writeJsonFile = function (filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'));
  } catch (error) {
    console.log('helper.writeJsonFile, error', error);
    throw error;
  }
};
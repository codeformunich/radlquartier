/**
 * helper
 *
 */
'use strict';

const fs = require('fs');

/**
 * helper functions
 */

exports.MapToPairs = function(map){
  return [...map];
};

exports.PairsToMap = function(pairs){
  if (pairs) {
    console.log('helper.PairsToMap, read existing Map');
    return new Map(pairs);
    
  } else {
    console.log('helper.PairsToMap, create new Map');
    return new Map();
  } 
};

exports.createDirectory = function(path) {
  if (!fs.existsSync(path)) {
    return this.mkdir(path);
  }
};

exports.readJsonFile = function(path) {
  return this.readFile(path)
    .then(data => {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.log('helper.readJsonFile, error', error.message);
        throw error;
      }
    })
    .catch(error => {
      console.error('helper.readJsonFile, error:', error.message);
      return null;
    });
};

exports.writeJsonFile = function(filePath, data) {
  let json;
  try {
    json = JSON.stringify(data, null, '\t');
  } catch (error) {
    console.log('helper.writeJsonFile, error', error.message);
    throw error;
  }

  return this.writeFile(filePath, json);
};

/**
 * wrapper for fs calls, with promises
 */

/**
 *
 * @param {*} path
 */
exports.mkdir = function(path) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.mkdir(path, function(error) {
      // check for errors
      if (error) {
        // console.error('helper.mkdir, error:', error.message);
        reject(error);
        return;
      } // the read succeeded

      resolve();
    });
  });
};

/**
 *
 * @param {*} path
 */
exports.readdir = function(path) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.readdir(path, function(error, files) {
      // check for errors
      if (error) {
        // console.error('helper.readdir, error:', error.message);
        reject(error);
        return;
      } // the read succeeded

      resolve(files);
    });
  });
};

/**
 *
 * @param {*} filename
 */
exports.exists = function(filename) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.exists(filename, function(error, contents) {
      // check for errors
      if (error) {
        reject(error);
        return;
      } // the read succeeded

      resolve(contents);
    });
  });
};

/**
 *
 * @param {*} filename
 */
exports.readFile = function(path) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.readFile(path, { encoding: 'utf8' }, function(error, data) {
      // check for errors
      if (error) {
        reject(error);
        return;
      } // the read succeeded

      resolve(data);
    });
  });
};

/**
 *
 * @param {*} filename
 * @param {*} data
 */
exports.writeFile = function(filename, data) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.writeFile(filename, data, function(error, contents) {
      // check for errors
      if (error) {
        reject(error);
        return;
      } // the write succeeded

      resolve(contents);
    });
  });
};

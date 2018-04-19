/**
 * helper
 *
 */
'use strict';

const fs = require('fs');

exports.createDirectorySync = function(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

exports.readDirectorySync = function(directory) {
  try {
    return fs.readdirSync(directory);
  } catch (error) {
    console.log('helper.readDirectory, error', error);
    throw error;
  }
};

exports.loadJsonFileSync = function(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.log('helper.loadJsonFile, error: ', error);
    return null;
  }
};

exports.writeJsonFileSync = function (filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'));
  } catch (error) {
    console.log('helper.writeJsonFile, error', error);
    throw error;
  }
};



exports.exists = function(filename) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.exists(filename, function(err, contents) {
      // check for errors
      if (err) {
        reject(err);
        return;
      } // the read succeeded

      resolve(contents);
    });
  });
};

exports.readFile = function(filename) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.readFile(filename, { encoding: 'utf8' }, function(err, contents) {
      // check for errors
      if (err) {
        reject(err);
        return;
      } // the read succeeded

      resolve(contents);
    });
  });
};

exports.writeFile = function(filename, data) {
  return new Promise(function(resolve, reject) {
    // trigger the asynchronous operation
    fs.writeFile(filename, JSON.stringify(data, null, '\t'), function(err, contents) {
      // check for errors
      if (err) {
        reject(err);
        return;
      } // the write succeeded

      resolve(contents);
    });
  });
};




// let promise = readFile('example.txt');

// // listen for both fulfillment and rejection
// promise.then(
//   function(contents) {
//     // fulfillment
//     console.log(contents);
//   },
//   function(err) {
//     // rejection
//     console.error(err.message);
//   }
// );

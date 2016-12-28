/*jshint node:true */
"use strict";

var program = require('commander');

// load commandline arguments
// program.parse(process.argv);
// var arg = program.args[0].split('.')[0];


// requiremetns for mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/infovis';


// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server.");
//   db.close();
// });

var allBikeNumbers;



var distinctBikeNumbers = function(db, callback) {
	// var cursor = db.collection('places').find( { "bike": 1 } );
   	
   	// var cursor = db.collection('places').distinct( "bike_numbers", { "bike": 1 } );

	db.collection('places').distinct( "bike_numbers", { "bike": 1 }, function(err, docs) {
		docs.sort();
		// console.log(docs);
		allBikeNumbers = docs;
		callback();
	} );

   // 	cursor.toArray(function(err, docs) {
   //  	assert.equal(err, null);
   //  	console.log("Found the following records");
   //  	console.log(docs);
   //  	// callback(docs);
  	// });
	
	// cursor.each(function(err, doc) {
	//    assert.equal(err, null);
	//    if (doc !== null) {
	//       console.dir(doc);
	//       console.log(doc);
	//    } else {
	//       callback();
	//    }
	// });
};

// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   distinctBikeNumbers(db, function() {
//       db.close();
//   });
// });

var createForAllBikes = function(db, bikeNumbers) {
	var bike = 0,
		length = bikeNumbers.length;

	console.log('createForAllBikes length: ', length);

	for (; bike <= length; bike++) {
		createMapDataSets(db, bikeNumbers[bike], insertData);
	}

};

var createMapDataSets = function(db, bike, callback) {
	console.log('createMapDataSets for bike: ', bike);

	// var previousPlace = null;
	var mapDatas = [];
	var mapData = null;
	// var bike = 97346;

	var cursor = db.collection('places').find( {"bike_numbers": bike } ).sort( {"date": 1} );
	cursor.each(function(err, place) {
	   assert.equal(err, null);
	   if (place !== null) {
	      

	      if (mapData === null) {
	      	mapData = createMapData(bike, place);
	      }
	      
	      if (place.lat === mapData.coordinates[0] && place.lng === mapData.coordinates[1]) {
	      	mapData.count = mapData.count + 1;
	      }
	      else {
	      	// console.log('log if: ', mapData);
	      	if (mapData) {
	      		mapDatas.push(mapData);
	      		// insertMapData(db, mapData);
	      	}
	      }

	   } else {
	   		//console.log('log else: ', mapData);
	      	if (mapData) {
	      		mapDatas.push(mapData);
	      		// insertMapData(db, mapData);
	      	}

	      	callback(db, mapDatas);
	   }
	});
};

var createMapData = function( bike, place) {
	console.log('createMapData for bike: ', bike);

	var mapData = {};

	mapData.bike = bike;
	mapData.coordinates =  [place.lat, place.lng];
	mapData.date = place.date;
	mapData.count = 0;

	return mapData;
};

var insertData = function(db, data) {
  	console.log('insertMapDatas');

  	db.collection('mapdatasets').insertMany( data, function(err, result) {
    	// assert.equal(null, err);
    	
    	console.log('Inserted data into mapdatasets collection');
  	});
};

MongoClient.connect(url, function(err, db) {
  assert.equal(err, null);
  
  distinctBikeNumbers(db, function() {
	createForAllBikes(db, allBikeNumbers);
	// function() {
 //      db.close();
 //  	});
  });

  // insertMapDatas(db, function() {
  // 	db.close();
  // } );
});
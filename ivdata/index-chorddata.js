"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/infovis';


MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    //prüfe ob vorherige koordinate && bikenumber == folgender koordinaten und bikenummber
    // wenn ja lösche datensatz wenn nein prüfe ob was start und endkoordinaten sind
    //Fälle: frei frei , station frei (nicht stationspendler), station station, frei station (Stationspendler)
    //FAll eins speicher ab counter nicht pendler +1
    //Fall zwei counter pendler +1 + Linie zur station

    var BikeNum;
    var lat;
    var lng;
    var nextLat;
    var nextLng;

	function whatFlag (BikeNum, lat, lng, nextLat, nextLng)

    db.features.find().forEach(<function>)

    // do some work here with the database.

    //Close connection
    db.close();
  }
});
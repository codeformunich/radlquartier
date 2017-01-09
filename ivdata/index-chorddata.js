"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var mongodb = require('mongodb');
var assert = require('assert');
var MongoClient = mongodb.MongoClient;
var express = require('express');
var router = express.Router();
var url = 'mongodb://localhost:27017/infovis';


MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
}
    //prüfe ob vorherige koordinate && bikenumber == folgender koordinaten und bikenummber
    // wenn ja lösche datensatz wenn nein prüfe ob was start und endkoordinaten sind
    //Fälle: frei frei , station frei (nicht stationspendler), station station, frei station (Stationspendler)
    //FAll eins speicher ab counter nicht pendler +1
    //Fall zwei counter pendler +1 + Linie zur station

    router.get('/get-dataForChord', function (req, res, next) {
        var resultArray = [];
        var BikeNum;
        var lat;
        var lng;
        var nextLat;
        var nextLgn;

        var cursor = db.features.find().sort({
        "properties.name": 1,
        "properties.date": 1

        });
        
    
        cursor.forEach(function(doc, err) {
            assert.(null, err);
            resultArray.push(doc);
        }, function() {

db.close();
});
res.render('index', {items: resultArray});
        });
    });

